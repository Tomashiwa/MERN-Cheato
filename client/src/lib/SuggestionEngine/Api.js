import axios from "axios";

export const vote = (type, user, sheet, done) => {
	axios
		.post(`/api/users/vote/add/${user.id}`, { sheetId: sheet.id, type: type })
		.then((res) => console.log(`Added sheet to user's ${type}dSheets`))
		.catch((err) =>
			console.log(`Error encountered when adding sheet to user's ${type}dSheets`)
		);

	axios
		.post(`/api/cheatsheets/vote/add/${sheet.id}`, { userId: user.id, type: type })
		.then((res) => console.log(`Added user to sheet's ${type}dUsers`))
		.catch((err) => console.log(`Error encountered when adding user to sheet's ${type}dUsers`));

	done();
};

export const unvote = (type, user, sheet, done) => {
	axios
		.post(`/api/users/vote/remove/${user.id}`, { sheetId: sheet.id, type: type })
		.then((res) => console.log(`Removed sheet from user's ${type}dSheets`))
		.catch((err) =>
			console.log(`Error encountered when removing sheet to user's ${type}dSheets`)
		);

	axios
		.post(`/api/cheatsheets/vote/remove/${sheet.id}`, { userId: user.id, type: type })
		.then((res) => console.log(`Removed user to sheet's ${type}dUsers`))
		.catch((err) =>
			console.log(`Error encountered when removing user to sheet's ${type}dUsers`)
		);

	done();
};

export const sheetsByUser = (user, done) => {
	axios
		.get(`/api/users/vote/${user.id}`)
		.then((res) => {
			return res.data;
		})
		.catch((err) => console.log(err));

	done();
};

const suggestionsFor = async (user) => {
	const res = await axios.get(`/api/suggestions/toUser/${user.id}`);
	if (res.status === 404) {
		console.log(`Error encountered when finding suggestions`);
		console.log(`${res}`);
	} else {
		return res.data;
	}
};

export const usersBySheet = (sheet, done) => {
	axios
		.get(`/api/cheatsheets/vote/${sheet._id}`)
		.then((res) => {
			return res.data;
		})
		.catch((err) => console.log(err));

	done();
};

export const suggestTo = async (user) => {
	const results = await suggestionsFor(user);
	return results;
};

export const random = async (limit) => {
	let requests = [];
	for (let i = 0; i < limit; i++) {
		requests.push(axios.get("/api/cheatsheets/random"));
	}
	const results = (await Promise.allSettled(requests)).map((result) => result.value.data);
	return results;
};
