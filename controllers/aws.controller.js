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

	// console.log('s3.uploadParams:', s3.uploadParams);
	// console.log("s3 uploadOptions", uploadOptions);

	client.upload(uploadOptions, (err, url) => {
		if(err) {
			console.log("ERROR");
			res.status(500).json({error: `Error -> ${err}`});
		} else {
			console.log("SUCCESS");
			res.status(200).json({message: `File uploaded successfully!`, url: url});
			return res;
		}
	});
}

// exports.doUpload = (req, res) => {
//   const s3Client = s3.s3Client;
//   const params = s3.uploadParams;

//   params.Key = req.file.originalname;
//   params.Body = req.file.buffer;

//   s3Client.upload(params, (err, data) => {
//     if (err) {
//       res.status(500).json({error:"Error -> " + err});
//     }
//     res.json({message: 'File uploaded successfully! -> keyname = ' + req.originalname, data: data});
//     return res;
//   });
// }
