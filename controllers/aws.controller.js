const s3 = require("../config/s3.config.js");
const s3BrowserDirectUpload = require("s3-browser-direct-upload");
const { config } = require("aws-sdk");

let s3clientOptions = {};
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
	const env = require("../config/s3.env.js");
	s3clientOptions = {
		accessKeyId: env.AWS_ACCESS_KEY,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		region: env.REGION
	};
} else {
	s3clientOptions = {
		accessKeyId: process.env.S3_KEY, 
		secretAccessKey: process.env.S3_SECRET, 
		region: process.env.S3_REGION
	};
}

const allowedTypes = ["jpg", "png"];
const client = new s3BrowserDirectUpload(s3clientOptions, allowedTypes); // allowedTypes is optional

exports.doUpload = (req, res) => {
	let uploadOptions = {
		key: req.file.originalname, // required
		data: req.file.buffer, // required
		bucket: "cheato", // required
		acl: 'public-read' // optional
	};

	client.upload(uploadOptions, (err, url) => {
		if(err) {
			res.status(500).json({error: `Error -> ${err}`});
		} else {
			res.status(200).json({message: `File uploaded successfully!`, url: url});
			return res;
		}
	});
}