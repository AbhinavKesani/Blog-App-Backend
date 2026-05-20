// read all articles
userRoute.get(
  "/articles",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res) => {
    let articles = await ArticleModel.find({
      isArticleActive: true,
    }).populate("comments.user", "email firstName");

    if (articles.length === 0) {
      return res.status(200).json({
        message: "no articles",
        payload: [],
      });
    }

    res.status(200).json({
      message: "list of articles are :",
      payload: articles,
    });
  }
);

// add comments
userRoute.put(
  "/articles",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res) => {
    const { articleId, comment } = req.body;

    let articleWithComment =
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
      ).populate(
        "comments.user",
        "email firstName"
      );

    if (!articleWithComment) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.status(200).json({
      message: "comment added successfully",
      payload: articleWithComment,
    });
  }
);