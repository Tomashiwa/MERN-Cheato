var scheduler = require("node-schedule");
const schedule = require("node-schedule");

const axios = require("axios");
const mongoose = require("mongoose");

var modUpdateJob = schedule.scheduleJob("0 0 * * *", () => {
	console.log("Checking for new modules...");

    const AY = new Date().getFullYear();

	axios.get(`https://api.nusmods.com/v2/${AY - 1}-${AY}/moduleList.json`).then((apiRes) => {
		const apiMods = apiRes.data.map((module) => {
			return `${module.moduleCode} - ${module.title}`;
		});

		const backendURL =
			process.env.NODE_ENV !== "production"
				? "http://localhost:5000/backend"
				: "https://cheato.herokuapp.com/backend";

		axios
			.get(`${backendURL}/schools/NUS`)
			.then((nusRes) => {
				const nusId = nusRes.data._id;

				axios.get(`${backendURL}/modules`).then((currentRes) => {
					const backendMods = currentRes.data.map((module) => module.name);

					const absentMods = apiMods
						.filter((module) => backendMods.indexOf(module) === -1)
						.map((module) => {
							return { school: mongoose.Types.ObjectId(nusId), name: module };
						});

					console.log(`${absentMods.length} new modules found..`);

					// If there is, post it as new mods into mongo
					if (absentMods.length > 0) {
						axios
							.post(`${backendURL}/modules`, absentMods)
							.then((res) => {
								console.log(`${res.data.newMods.length} added!`);
							})
							.catch((err) => console.log(`${err.name} - ${err.message}`));
					}
				});
			})
			.catch((err) => console.log(`${err.name} - ${err.message}`));
	});
});

console.log("Job scheduled");

module.exports = modUpdateJob;
