import Rater from "./Rater";
import Similars from "./Similars";
import Suggestions from "./Suggestions";

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
}

export default Engine;