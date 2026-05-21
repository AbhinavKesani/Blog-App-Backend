import exp from "express";
import mongoose from "mongoose";

import { register } from "../Services/authService.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const authorRoute = exp.Router();

/* REGISTER AUTHOR */
authorRoute.post("/users", async (req, res, next) => {
  try {
    const userObj = req.body;

    const newUserObj = await register({
      ...userObj,
      role: "AUTHOR",
    });

    res.status(201).json({
      message: "Author created",
      payload: newUserObj,
    });
  } catch (err) {
    next(err);
  }
});

/* CREATE ARTICLE */
authorRoute.post(
  "/articles",
  verifyToken("AUTHOR"),
  async (req, res, next) => {
    try {
      const article = req.body;

      const newArticle = new ArticleModel({
        ...article,
        author: req.user.userId,
      });

      const saved = await newArticle.save();

      res.status(201).json({
        message: "article is created",
        payload: saved,
      });
    } catch (err) {
      next(err);
    }
  }
);

/* GET AUTHOR ARTICLES */
authorRoute.get(
  "/articles",
  verifyToken("AUTHOR"),
  async (req, res, next) => {
    try {
      const authorId = req.user.userId;

      const allArticles = await ArticleModel.find({
        author: authorId,
      }).populate("author", "firstName email");

      res.status(200).json({
        message: "articles of author",
        payload: allArticles,
      });
    } catch (err) {
      next(err);
    }
  }
);

/* UPDATE ARTICLE */
authorRoute.put(
  "/articles/:articleId",
  verifyToken("AUTHOR"),
  async (req, res, next) => {
    try {
      const { articleId } = req.params;
      const { title, category, content } = req.body;

      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return res.status(400).json({
          message: "Invalid article ID",
        });
      }

      const updated = await ArticleModel.findOneAndUpdate(
        {
          _id: articleId,
          author: req.user.userId,
          isArticleActive: true,
        },
        {
          $set: { title, category, content },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updated) {
        return res.status(404).json({
          message: "Article not found or no permission",
        });
      }

      res.status(200).json({
        message: "Article updated",
        payload: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

/* TOGGLE ARTICLE STATUS */
authorRoute.patch(
  "/articles/:id/status",
  verifyToken("AUTHOR"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { isArticleActive } = req.body;

      const article = await ArticleModel.findById(id);

      if (!article) {
        return res.status(404).json({
          message: "Article not found",
        });
      }

      if (article.author.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      article.isArticleActive = isArticleActive;

      await article.save();

      res.status(200).json({
        message: "Article status updated",
        payload: article,
      });
    } catch (err) {
      next(err);
    }
  }
);