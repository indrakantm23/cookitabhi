const express = require('express');
const bodyParser = require('body-parser');
const Blog = require('./../model/blog.model');

const blogRouter = express.Router();
blogRouter.use(bodyParser.json());

// Get blogs
blogRouter.route('/').get((req, res) => {
    Blog.find((err, blogs) => {
        if(err){
            console.log(err);
        }else{
            res.json(blogs.slice(0).reverse());
        }
    });
});


// Get blogs of user
blogRouter.route('/:id').get((req, res) => {
    Blog.find((err, blogs) => {
        if(err){
            console.log(err);
        }else{
            let arr = blogs.filter((a => { return a.user_id && a.user_id!== null && a.user_id.toString() === req.params.id.toString()}))
            res.json({blogs: arr, blog_count: arr.length})

        }
    });
});


// Get a blog
blogRouter.route('/blog/:id').get((req, res)=> {
    let id = req.params.id;
    Blog.findById(id, (err, blog)=> {
        res.json(blog);
    });
});


// Post a comment
blogRouter.route('/addComment/:id').post(function(req, res){
    Blog.findById(req.params.id, (err, blog) => {
        if(err) {
            res.json({ err });
        }else{
            blog.comments.push(req.body);
            blog.save();
            res.json({comments: blog.comments})
        }
    });
});


// Get blog comments
blogRouter.route('/getComment/:id').get(function(req, res){
    Blog.findById(req.params.id, (err, blog) => {
        if(err) {
            res.json({ err });
        }else{
            res.json({comments: blog.comments})
        }
    });
});


// Delete a comment
blogRouter.route('/delete-comment/:id').post((req, res)=>{
    let i = req.body.i;
    Blog.findById(req.params.id, (err, blog) => {
        if(err){
            res.json({err});
        }else{
            blog.comments.splice(i, 1);
            blog.save();
            res.json({comments: blog.comments});
        }
    });
});







module.exports = blogRouter;