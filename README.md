# Cheato
Access the live version of this website [here](https://cheato.herokuapp.com)

## About :book:
Many have spent days writing notes for their modules but the examination only allows for a single A4 cheat sheet. Then, comes the hassle where we look through our notes to pick up what is important to add to that one measly A4 paper. Many savvy students then resort to Google for an automated solution but the existing online cheatsheet generators are extremely limited or are not user-friendly. When time was running out and with limited options, many went in with an incomplete cheat sheet and left the exam hall with regrets. 

So, Cheato is here to provide a simple solution for users to compress multiple images into a single A4 page using a component-based layout system that sort images for reading convenience. Cheato will accept multiple file types then resize and rearrange the images to fit the user’s needs.

## Features :balance_scale:

## How to setup :rocket:
1. Clone this repository and open it in your preferred code editor or IDE (For demonstration purposes, Visual Code will be used here)
2. Install the necessary dependencies by running these commands
```
npm install
npm run client-install
```
3. To link your backend (MongoDB and AWS S3), create the following files
### keys.js
```
module.exports = {
    mongoURI: //----------//
    jwtSecret: //----------//
}
```

### s3.env.js
```
const env = {
    AWS_ACCESS_KEY: 'ABCDEFGHIJKLMNOPQRST', // change to yours
    AWS_SECRET_ACCESS_KEY: '123456789012345678901234567890123456789', // change to yours
    REGION : 'ap-southeast-1', // change to yours
    Bucket: 'cheato'
  };
   
  module.exports = env;
```
Note. If you are unsure of how to setup the backend, you may refer to [here]() and [here]()

4. A local version can then be run with this command
```
npm run dev
```

## API :clipboard:

## Future improvements :hammer_and_wrench:
As of the latest feature update, there are several areas that this project can be improved upon:
- Load time

- Image arrangement

Images were arranged using [Binary Tree Algrithm for 2D bin packing](https://github.com/jakesgordon/bin-packing) from JakesGordon. Due to binpack algorithm being a deep topic with many academic research on it, this implementation of binpack algorithm may not be the most optimal for Cheato. With our relatively short development period, we decided to adapt that library to showcase the cheatsheet creation experience that we want in Cheato. 

Further research into objects sorting in 2D space may help to achieve a better performing algorithm or find alternatives other than binpacking that are more suitable for image arrangement.

- Suggestion System

Due to it being primarily driven by user's voting on a cheatsheet, this feature require a formidable user base to perform to its greatest potential. In our live app, we had to introduce dummy accounts and cheatsheets in order to let the system generate proper suggestions.

To mitigate this issue, the system must start to consider additional factors other then just votes. Some factors can be user's viewing history, bookmarks and uploads

## Packages used :package:
