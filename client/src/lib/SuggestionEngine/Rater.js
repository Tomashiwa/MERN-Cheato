import axios from "axios";

class Rater {
    constructor(engine, type) {
        this.engine = engine;
        this.type = type;
    }

    add(user, sheet, done) {
        axios.post(`/api/users/vote/add/${user.id}`, {sheetId: sheet._id, type: this.type})
            .then(res => console.log(`Added sheet to user's ${this.type}dSheets`))
            .catch(err => console.log(`Error encountered when adding sheet to user's ${this.type}dSheets`));

        axios.post(`/api/cheatsheets/vote/add/${sheet._id}`, {userId: user.id, type: this.type})
            .then(res => console.log(`Added user to sheet's ${this.type}dUsers`))
            .catch(err => console.log(`Error encountered when adding user to sheet's ${this.type}dUsers`));

        done();
    }

    remove(user, sheet, done) {
        axios.post(`/api/users/vote/remove/${user.id}`, {sheetId: sheet._id, type: this.type})
            .then(res => console.log(`Removed sheet from user's ${this.type}dSheets`))
            .catch(err => console.log(`Error encountered when removing sheet to user's ${this.type}dSheets`));

        axios.post(`/api/cheatsheets/vote/remove/${sheet._id}`, {userId: user.id, type: this.type})
            .then(res => console.log(`Removed user to sheet's ${this.type}dUsers`))
            .catch(err => console.log(`Error encountered when removing user to sheet's ${this.type}dUsers`));

        done();
    }

    sheetsByUsers(user, done) {
        axios.get(`/api/users/vote/${user.id}`)
            .then(res => {
                console.log(`Sheets voted by user ${user.id}`);
                console.log(res.data);
                return res.data;
            })
            .catch(err => console.log(err));

        done();
    }

    usersBySheet(sheet, done) {
        axios.get(`/api/cheatsheets/vote/${sheet._id}`)
            .then(res => {
                console.log(`Users voted for sheet ${sheet._id}`);
                console.log(res.data);
                return res.data;
            })
            .catch(err => console.log(err));

        done();
    }
}

export default Rater;