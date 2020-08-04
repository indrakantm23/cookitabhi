const express = require('express');
const bodyParser = require('body-parser');
const Story = require('./../model/story.model');

const storyRouter = express.Router();
storyRouter.use(bodyParser.json());

// GET ALL USERS
storyRouter.route('/').get((req, res)=> {
    Story.find((err, stories) => {
        if(err){
            res.send(err);
        }
        else{
            res.json(stories)
        }
    });
});


// Post Story
storyRouter.route('/post-story').post((req, res) => {
    let story = new Story(req.body);
    story.save().then(story => {
        res.status(200).json({msg: 'Story posted successfully', story});
    })
    .catch(err => {
        res.status(400).send('Failed posting story');
    });
});


// Delete a story
storyRouter.route('/delete-story/:id').get((req, res)=>{
    let id = req.params.id.toString();
    let query = {_id: id};
    Story.remove(query, (err, story)=>{
        if(err){
            console.log(err);
        }else{
            res.status(200).json({msg: 'story deleted'})
        }
    });
});

module.exports = storyRouter;