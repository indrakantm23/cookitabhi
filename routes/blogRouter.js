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

// Post a Blog
blogRouter.route('/post-blog').post((req, res)=> {
    let blog = new Blog(req.body);
    blog.save()
        .then(blog => {
            res.status(200).json({blog: 'Blog posted successfully', data: blog});
        })
        .catch(err => {
            res.status(400).send('adding blog failed');
        });
});



blogRouter.route('/blog/:id').post(function(req, res){
    let uid = req.body.id;
    let blogId = req.params.id;
    let likeData = {}; let likeBlogs = [];
    Blog.findById(req.params.id, function(err, blog){
        if(!blog)
            res.status(404).send('Blog not found');
        else
            blog.total_likes = blog.total_likes+1;
            blog.liked = true

            blog.save().then(blog => {
                // res.json({total_likes: blog.total_likes})
                likeData.total_likes = blog.total_likes;
                User.findById(uid, (err, user)=> {
                    user.liked_blogs.push(blogId);
                    
                    user.save();
                    likeBlogs = user.liked_blogs;
                    res.json({likeData, likeBlogs})
                })
                // res.json({likeData, likeBlogs})
            })
            // .then(res => 
            //     User.findById(uid, (err, user)=> {
            //         user.liked_blogs.push(blogId);
            //         user.save();
            //         console.log(user);
            //     })
            //     )
            .catch(err => {
                res.status(400).send('Count not like');
            });
    });
});


module.exports = blogRouter;