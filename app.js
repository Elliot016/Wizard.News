const express = require("express");
const morgan = require("morgan");
const postBank = require("./postBank");

const app = express();

app.use(morgan("dev"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  const posts = postBank.list();

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <title>Wizard News</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="news-list">
      <header><img src="/logo.png"/>Wizard News</header>
      ${posts
        .map(
          (post) => `
        <div class='news-item'>
          <p>
            <span class="news-position">${post.id}. ▲</span>
            ${post.title}
            <small>(by ${post.name})</small>
          </p>
          <small class="news-info">
            ${post.upvotes} upvotes | ${post.date} | <a href="/posts/${post.id}">${post.title}</a>
          </small>
        </div>`
        )
        .join("")}
    </div>
  </body>
</html>`;

  res.send(html);
});

// say that a client GET requests the path /users/nimit
app.get("/users/:name", (req, res) => {
  console.log(req.params.name); // --> 'nimit'
});

app.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  const post = postBank.find(id);
  if (!post.id) {
    // If the post wasn't found, just throw an error
    const error = new Error("Not Found");
    error.status = 404;
    throw error;
  }
  // ... Otherwise, send the regular post detail HTML
  const html = `<!DOCTYPE html>
  <html>
  <head>
    <title>Wizard News</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="news-list">
      <header><img src="/logo.png"/>Wizard News</header>
        <div class='news-item'>
          <p>
            <span class="news-position">${post.id}. ▲</span>
            ${post.title}
            <small>(by ${post.name})</small>
          </p>
          <p>${post.content}</p>
        </div>
    </div>
  </body>
</html>`;

  res.send(html);
});

app.use((err, req, res, next) => {
  // Set the response status code
  res.status(err.status || 500);

  if (err.status === 404) {
    res.send(`<!DOCTYPE html>
      <html>
      <head>
        <title>Wizard News</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <div class="news-list">
          <header><img src="/logo.png"/>404 Not Found</header>
          <p>Unable to find the page try a different url</p>
        </div>
      </body>
    </html>`);
  } else {
    res.send("An error occurred while processing your request.");
  }

  // Don't display the stack trace in HTML format
  console.error(err);
});

const { PORT = 1337 } = process.env;

app.listen(PORT, () => {
  console.log(`App listening in port ${PORT}`);
});