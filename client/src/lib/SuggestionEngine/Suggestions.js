import axios from "axios";

class Suggestions {
    async forUser(user) {
        const res = await axios.get(`/api/suggestions/toUser/${user.id}`);
        if(res.status === 404) {
            console.log(`Error encountered when finding suggestions`);
            console.log(`${res}`);
        } else {
            console.log("Suggestions found:");
            console.log(res);

            return res.data;
        }
    }

    async update(user) {
        const similarities = (await axios.get(`/api/similars/toUser/${user.id}`)).data;
        const unvotedSheets = (await axios.get(`/api/cheatsheets/withoutVotes/${user.id}`)).data;

        console.log("similarities");
        console.log(similarities);
        console.log(`unvotedSheets for user ${user.id}`);
        console.log(unvotedSheets);

        console.log(unvotedSheets.map(sheet => {return {id: sheet._id, name: sheet.name}}));

        const suggestions = await Promise.all(unvotedSheets.map(async(unvotedSheet) => {
            const upvotedUsers = (await axios.get(`/api/cheatsheets/vote/${unvotedSheet._id}?type=upvote`)).data;
            const downvotedUsers = (await axios.get(`/api/cheatsheets/vote/${unvotedSheet._id}?type=downvote`)).data;

            console.log(`Users that upvoted for sheet ${unvotedSheet._id}`)
            console.log(upvotedUsers);
            console.log(`Users that downvoted for sheet ${unvotedSheet._id}`)
            console.log(downvotedUsers);

            let upvoteSimilarities = 0;
            let downvoteSimilarities = 0;

            upvotedUsers.forEach(upvotedUser => {
                console.log(`upvotedUser: ${upvotedUser} / type: ${typeof(upvotedUser)}`);
                console.log(`Has similarity index: ${similarities.find(similarity => similarity.user === upvotedUser)}`);
                console.log(similarities[0]);
                console.log(`type: ${typeof(similarities[0].user)}`);

                const similarUser = similarities.find(similarity => similarity.user === upvotedUser);
                upvoteSimilarities += similarUser.index;
            });

            downvotedUsers.forEach(downvotedUser => {
                const similarUser = similarities.find(similarity => similarity.user === downvotedUser);
                downvoteSimilarities += similarUser.index;
            });

            console.log(`upvoteSimilarities: ${upvoteSimilarities}`);
            console.log(`downvoteSimilarities: ${downvoteSimilarities}`);
            console.log(`upvotedUsers.length: ${upvotedUsers.length}`);
            console.log(`downvotedUsers.length: ${downvotedUsers.length}`);

            let probability = 0.0;

            if((upvotedUsers.length + downvotedUsers.length) !== 0) {
                probability = (upvoteSimilarities - downvoteSimilarities) / (upvotedUsers.length + downvotedUsers.length);
            }

            console.log(`probability: ${probability}`);

            return {id: unvotedSheet._id, probability};
        }));

        suggestions.sort((a, b) => b.probability - a.probability);
        
        console.log(`sorted suggestions:`);
        console.log(suggestions);

        const suggestionRes = await axios.post(`/api/suggestions/toUser/${user.id}`, {suggestions});
        if(suggestionRes.status === 404) {
            console.log("Error while submiting suggestions");
            console.log(suggestionRes);
        } else {
            console.log("Suggestions submitted");
            console.log(suggestionRes.data);
        }
    }
}

export default Suggestions;