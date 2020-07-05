import Rater from "./Rater";
import Similars from "./Similars";
import Suggestions from "./Suggestions";
import axios from "axios";

class Engine {
    constructor() {
        this.upvotes = new Rater(this, "upvote");
        this.downvotes = new Rater(this, "downvote");
        this.similars = new Similars();
        this.suggestions = new Suggestions();
    }

    async suggestTo(user) {
        await this.similars.update(user);
        await this.suggestions.update(user);

        const results = await this.suggestions.forUser(user);
        
        return results;
    }

    async random(limit) {
        let requests = [];
        for(let i = 0; i < limit; i++) {
            requests.push(axios.get("/api/cheatsheets/random"));
        }
        const results = (await Promise.allSettled(requests)).map(result => result.value.data);
        return results;
    }
}

export default Engine;