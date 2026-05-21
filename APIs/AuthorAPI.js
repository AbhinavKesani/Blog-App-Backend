import React, { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-hot-toast";

import {
  pageBackground,
  pageWrapper,
  articleGrid,
  articleCardClass,
  articleTitle,
  articleBody,
  timestampClass,
  ghostBtn,
  loadingClass,
  errorClass,
} from "../styles/common";

function UserDashboard() {
  const CurrentUser = useAuth((state) => state.CurrentUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  // Fetch articles
  useEffect(() => {
    const read = async () => {
      setLoading(true);

      try {
        const res = await axios.get(
          "https://blog-app-backend-tgj0.onrender.com/author-api/articles",
          {
            withCredentials: true,
          }
        );

        setArticles(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.error || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    read();
  }, []);

  // Safe date format
  const formatDate = (date) => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString("en-IN");
  };

  // Safe author name
  const getAuthorName = (author) => {
    if (!author) return "Unknown Author";

    if (typeof author === "string") return "Author";

    return author.firstName || "Author";
  };

  // Navigate to article
  const navigateToArticle = (articleObj) => {
    navigate(`/article/${articleObj._id}`, {
      state: articleObj,
    });
  };

  if (loading) {
    return <p className={loadingClass}>Loading articles...</p>;
  }

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>
        {error && <p className={errorClass}>{error}</p>}

        {/* Articles */}
        <div className={articleGrid}>
          {articles.map((articleObj) => (
            <div key={articleObj?._id} className={articleCardClass}>
              <div className="flex flex-col h-full">
                <div>
                  <p className={articleTitle}>
                    {articleObj?.title || "Untitled"}
                  </p>

                  <p className={articleBody}>
                    {articleObj?.content
                      ? articleObj.content.slice(0, 120) + "..."
                      : "No content available"}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    {getAuthorName(articleObj?.author)}
                  </p>

                  <p className={timestampClass}>
                    {formatDate(articleObj?.createdAt)}
                  </p>
                </div>

                <button
                  onClick={() => navigateToArticle(articleObj)}
                  className={`${ghostBtn} mt-auto pt-4`}
                >
                  Read Article
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;