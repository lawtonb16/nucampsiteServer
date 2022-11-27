const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Favorite.find()
            .populate("user._id")
            .populate('campsite._id')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch((err) => next(err));
    })
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Favorite.findOne({user: req.user._id})
                .then((favorite) => {
                    req.body.map(id => {
                        if (favorite.includes(id)) {
                            return;
                        } 
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorite.campsite.id(id));
                    })
                })
                .catch((err) => next(err));
        },
    )
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /Favorites");
    })
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Favorite.deleteMany()
                .then((response) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(response);
                })
                .catch((err) => next(err));
        },
    );

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Favorite.findById(req.params.FavoriteId)
            .populate("user")
            .populate('campsite')
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        
    })
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Favorite.findByIdAndUpdate(
                req.params.FavoriteId,
                {
                    $set: req.body,
                },
                { new: true },
            ).then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            });
        },
    )
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Favorite.findByIdAndDelete(req.params.FavoriteId)
                .then((response) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(response);
                })
                .catch((err) => next(err));
        },
    );
