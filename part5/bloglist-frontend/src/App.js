import React, { useState, useEffect, useRef } from "react";
import blogService from "./services/blogs";
import loginService from "./services/login";
import Notification from "./components/Notification";
import Blogs from "./components/Blogs";
import LoginForm from "./components/Login";
import "./App.css";
import Togglable from "./components/Togglable";
import BlogForm from "./components/BlogForm";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [user, setUser] = useState(null);
  const [opsMessage, setOpsMessage] = useState("");
  const [loginVisible, setLoginVisible] = useState(false);
  const blogFormRef = useRef();

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log("logging in with", username, password);

    try {
      const user = await loginService.login({
        username,
        password,
      });

      window.localStorage.setItem("loggedBlogAppUser", JSON.stringify(user));

      blogService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
    } catch (exception) {
      setOpsMessage(`Wrong username or password`);
      setTimeout(() => {
        setOpsMessage(null);
      }, 5000);
    }
  };

  const handleLogout = () => {
    console.log("handleLogout Initiated");
    window.localStorage.removeItem("loggedBlogAppUser", JSON.stringify(user));
  };

  const handleAddBlog = (event) => {
    event.preventDefault();
    console.log("adding blog with", title, author, url, user);
    try {
      const blogObject = {
        user: user,
        title: title,
        author: author,
        url: url,
      };
      blogFormRef.current.toggleVisibility();
      blogService.create(blogObject).then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog));
        setOpsMessage(`${user.username} added a new blog: ${title}`);
        setTimeout(() => {
          setOpsMessage(null);
        }, 5000);
        setAuthor("");
        setTitle("");
        setUrl("");
      });
    } catch (exception) {
      setOpsMessage("Blog could not be added");
      setTimeout(() => {
        setOpsMessage(null);
      }, 5000);
    }
  };

  const handleDeleteBlog = async (targetBlog) => {
    try {
      const result = window.confirm(`Remove blog ${targetBlog}`);
      if (result) {
        await blogService.remove(targetBlog.id);
        setBlogs(blogs.filter((blog) => blog.id !== targetBlog.id));
      }
    } catch (exception) {
      console.log(`blog delete button failed: ${exception}`);
    }
  };

  const handleAddLike = async (targetBlog, likes) => {
    console.log("liking", targetBlog.title);
    try {
      const blogObject = {
        user: targetBlog.user,
        likes: likes + 1,
        author: targetBlog.author,
        title: targetBlog.title,
        url: targetBlog.url,
      };

      blogService.change(blogObject, targetBlog.id);
    } catch (exception) {
      console.log(`Like button failed: ${exception}`);
    }
  };

  const blogForm = () => (
    <Togglable buttonLabel="new blog" ref={blogFormRef}>
      <BlogForm
        handleAddBlog={handleAddBlog}
        title={title}
        author={author}
        url={url}
        setTitle={({ target }) => setTitle(target.value)}
        setAuthor={({ target }) => setAuthor(target.value)}
        setUrl={({ target }) => setUrl(target.value)}
      />
    </Togglable>
  );

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? "none" : "" };
    const showWhenVisible = { display: loginVisible ? "" : "none" };

    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)} className="btn">
            login
          </button>
        </div>

        <div style={showWhenVisible}>
          <LoginForm
            username={username}
            password={password}
            setPassword={({ target }) => setPassword(target.value)}
            setUsername={({ target }) => setUsername(target.value)}
            handleLogin={handleLogin}
          />
          <button onClick={() => setLoginVisible(false)} className="btn">
            cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="main">
      <h2>Blogs</h2>
      <div className="notification">
        <Notification message={opsMessage} />
      </div>
      {user === null ? (
        loginForm()
      ) : (
        <div>
          <p>
            {user.name} logged in
            <span>
              <button onClick={handleLogout} className="btn">
                logout
              </button>
            </span>
          </p>
        </div>
      )}

      {blogForm()}

      <Blogs
        blogs={blogs}
        handleDeleteBlog={handleDeleteBlog}
        handleAddLike={handleAddLike}
      ></Blogs>
    </div>
  );
};
export default App;
