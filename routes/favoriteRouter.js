const express = require("express");
const cors = require("./cors");
const authenticate = require("../authenticate");
const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Favorite.find()
            .populate("user")
            .populate("campsites")
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites) {
                    req.body.forEach((id) => {
                        if (favorites.campsites.includes(id._id)) {
                            return;
                        }
                        favorites.campsites.push(id._id);
                    });
                    favorites.save().then((favorites) => {
                        console.log("Favorites Updated", favorites);
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorites);
                    });
                } else {
                    Favorite.create({
                        campsites: req.body,
                        user: req.user._id,
                    }).then((favorites) => {
                        console.log("Favorites Created", favorites);
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorites);
                    });
                }
            })

            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((response) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
            })
            .catch((err) => next(err));
    });

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(
            `GET operation not supported on /favorites/${req.params.campsiteId}`,
        );
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id }).then((favorites) => {
            if (favorites) {
                if (favorites.campsites.includes(req.params.campsiteId)) {
                    res.statusCode = 403;
                    res.end(
                        `Campsite ${req.params.campsiteId} is already favorited`,
                    );
                } else {
                    favorites.campsites.push(req.params.campsiteId);
                    favorites.save().then((favorites) => {
                        console.log("Favorites Updated", favorites);
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorites);
                    });
                }
            } else {
                Favorite.create({
                    campsites: req.body,
                    user: req.user._id,
                }).then((favorites) => {
                    console.log("Favorites Created", favorites);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorites);
                });
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites/favoriteId");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites) {
                    favorites.campsites.splice(
                        favorites.campsites.indexOf(req.params.campsiteId),
                        1,
                    );
                    favorites.save().then((favorites) => {
                        console.log("Favorites Updated", favorites);
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorites);
                    });
                } else {
                    res.statusCode = 403;
                    res.setHeader("Content-Type", "text/plain");
                    res.end(`A favorite document doesnt exist for ${req.user}`);
                }
            })
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;
