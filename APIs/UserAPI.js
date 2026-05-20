import exp from "express";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const userRoute = exp.Router();

/* READ ALL ARTICLES */
userRoute.get(
  "/articles",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const articles = await ArticleModel.find({
        isArticleActive: true,
      }).populate("comments.user", "email firstName");

      return res.status(200).json({
        message:
          articles.length === 0
            ? "no articles"
            : "list of articles",
        payload: articles,
      });
    } catch (err) {
      next(err);
    }
  }
);

/* ADD COMMENT */
userRoute.put(
  "/articles",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { articleId, comment } = req.body;

      if (!articleId || !comment) {
        return res.status(400).json({
          message: "articleId and comment are required",
        });
      }

      const articleWithComment =
        await ArticleModel.findOneAndUpdate(
          {
            _id: articleId,
            isArticleActive: true,
          },
          {
            $push: {
              comments: {
                user: req.user.userId,
                comment,
              },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        ).populate("comments.user", "email firstName");

      if (!articleWithComment) {
        return res.status(404).json({
          message: "Article not found",
        });
      }

      return res.status(200).json({
        message: "comment added successfully",
        payload: articleWithComment,
      });
    } catch (err) {
      next(err);
    }
  }
);