# Cheato
A website to create, host and share your cheatsheets with other users

Access the live version [here](https://cheato.herokuapp.com) !

## About :book:
Many have spent days writing notes for their modules but the examination only allows for a single A4 cheat sheet. Then, comes the hassle where we look through our notes to pick up what is important to add to that one measly A4 paper. Many savvy students then resort to Google for an automated solution but the existing online cheatsheet generators are extremely limited or are not user-friendly. When time was running out and with limited options, many went in with an incomplete cheat sheet and left the exam hall with regrets. 

So, Cheato is here to provide a simple solution for users to compress multiple images into a single A4 page using a component-based layout system that sort images for reading convenience. Cheato will accept multiple file types then resize and rearrange the images to fit the user’s needs.

## Features :balance_scale:
### Creating Cheatsheet
By uploading your images, Cheato will help you to arrange them and achieve an efficient layout, allow you to save as much space as you can for your cheatsheet

![sort demo](https://media.giphy.com/media/LniGMwUxuaWEERTD1N/giphy.gif)

### Sharing with users
User-created and uploaded cheatsheets are presented in the form of a Card, shared with other users of Cheato if the user set it to be avaliable to public

![scroll demo](https://media.giphy.com/media/gdvzagwnZKX1zCduMz/giphy.gif)

### Feedback system
Users may provide feedback on cheatsheet in the form of comments and upvote/downvote

![feedback demo](https://media.giphy.com/media/iFJ4RPr3PH5uwLWX97/giphy.gif)

### Syncing with NUSMods API
Up-to-date modules from National University of Singapore with scheduled syncing with [NUSMods API](https://api.nusmods.com/v2/) daily

![module demo](https://media.giphy.com/media/jQh9JZocdvOdbOCLk3/giphy.gif)

### Suggestion system
Cheatos generates a list of suggestions for you by analyzing users that are similar to you and their voting behavior

![suggestion demo](https://media.giphy.com/media/YqKOKeVClzlnPjuB6T/giphy.gif)

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
    mongoURI: mongodb+srv://XXX:@XXX.mongodb.net/XXX?retryWrites=true&w=majority // Change to yours
    jwtSecret: "XXX" // Change to yours
}
```

### s3.env.js
```
const env = {
    AWS_ACCESS_KEY: 'ABCDEFGHIJKLMNOPQRST', // Change to yours
    AWS_SECRET_ACCESS_KEY: '123456789012345678901234567890123456789', // Change to yours
    REGION : 'ap-southeast-1', // Change to yours
    Bucket: 'cheato'
  };
   
  module.exports = env;
```
Note. If you are unsure of how to setup the backend, you may refer to [here]() and [here]()


4. A local version can then be run with this command
```
npm run dev
```

## Future improvements :hammer_and_wrench:
As of the latest feature update, there are several areas that this project can be improved upon:
- Load time

Due to our choice of using Heroku to host our server, this caused a significant load time for Cheato. The primary cause is the regional difference between where our server is hosted and where our backend services (MongoDB and AWS S3) is. Heroku only provide their service in US and Europe area while our backend services are in South East Asia region, as such the latency cost is inevitable.

So, a shift away from Heroku is necessary. We consider that switching to using Docker to package Cheato and then hosting it as a website on AWS EC2 will be the right step forward.

- Image arrangement

Images were arranged using [Binary Tree Algrithm for 2D bin packing](https://github.com/jakesgordon/bin-packing) from JakesGordon. Due to binpack algorithm being a deep topic with many academic research on it, this implementation of binpack algorithm may not be the most optimal for Cheato. With our relatively short development period, we decided to adapt that library to showcase the cheatsheet creation experience that we want in Cheato. 

Further research into objects sorting in 2D space may help to achieve a better performing algorithm or find alternatives other than binpacking that are more suitable for image arrangement.

- Suggestion System

Due to it being primarily driven by user's voting on a cheatsheet, this feature require a formidable user base to perform to its greatest potential. In our live app, we had to introduce dummy accounts and cheatsheets in order to let the system generate proper suggestions.

To mitigate this issue, the system must start to consider additional factors other then just votes. Some factors can be user's viewing history, bookmarks and uploads

## Packages used :package:
- [React-Konva](https://github.com/konvajs/react-konva)
- [DayJS](https://github.com/iamkun/dayjs)
- [Semantic-UI](https://github.com/Semantic-Org/Semantic-UI-React)
- [React-Strap](https://github.com/reactstrap/reactstrap)
- [AWS-sdk](https://github.com/aws/aws-sdk-js)
- [Axios](https://github.com/axios/axios)
- [BcryptJS](https://github.com/dcodeIO/bcrypt.js)
- [Fuse.JS](https://github.com/krisk/Fuse)
- [JsonWebToken](https://github.com/auth0/node-jsonwebtoken)
- [Mongoose](https://github.com/Automattic/mongoose)
- [MockServiceWorker](https://mswjs.io/)
- [Node-SASS](https://github.com/sass/node-sass)
- [Node-Schedule](https://github.com/node-schedule/node-schedule)
- [Jest](https://github.com/facebook/jest)
- [Enzyme](https://github.com/enzymejs/enzyme)
- [S3-Browser-Direct-Upload](https://github.com/SwingDev/s3-browser-direct-upload)
- [Heroku-SSL-Redirect](https://github.com/nodenica/node-heroku-ssl-redirect)
- [SCSS](https://github.com/sass/node-sass)
- [SCSS-powertools](https://github.com/Tutrox/scss-powertools)
