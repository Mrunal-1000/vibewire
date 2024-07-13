const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.body.category;
        const dir = path.join(__dirname, 'public', 'blogs', category);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Handle file upload
app.post('/upload', upload.fields([{ name: 'blogText' }, { name: 'blogImage' }]), (req, res) => {
    const category = req.body.category;
    const blogText = req.files['blogText'][0];
    const blogImage = req.files['blogImage'][0];

    // Read and parse the blog text file
    const blogContent = fs.readFileSync(blogText.path, 'utf8');
    const lines = blogContent.split('\n');
    let title = lines.shift();
    title = title.replace('##', '');
    title = title.replace('##', ''); 

    let content = lines.join('\n');

    // Replace markdown with HTML tags
    content = content
        .replace(/^##(.*?)##/gm, '<h1>$1</h1>') // Convert ## heading to <h1>
        .replace(/^#(.*?)#/gm, '<h2>$1</h2>')   // Convert # subheading to <h2>
        .replace(/\n/g, '<br><br>');            // Replace new lines with <br><br>

    // Create a blog object
    const blog = {
        title: title,
        image: `/blogs/${category}/${blogImage.filename}`,
        content: content,
        url: `/blogs/${category}/${blogText.filename.replace('.txt', '.html')}`
    };

    // Save the blog object to a JSON file
    const blogsFilePath = path.join(__dirname, 'public', 'blogs', category, 'blogs.json');
    let blogs = [];
    if (fs.existsSync(blogsFilePath)) {
        blogs = JSON.parse(fs.readFileSync(blogsFilePath));
    }
    blogs.push(blog);
    fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));

    // Create the individual blog HTML file
    const blogHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blog.title}</title>
    <link rel="stylesheet" href="/css/${category}.css">
</head>
<body>
    <section id="blog-content">
        <img src="${blog.image}" alt="${blog.title}">
        <h1>${blog.title}</h1>
        <p>${blog.content}</p>
    </section>
</body>
</html>
`;
    fs.writeFileSync(path.join(__dirname, 'public', 'blogs', category, blogText.filename.replace('.txt', '.html')), blogHtml);

    res.redirect(`/${category}.html`);
});

// Fetch blogs for a category
app.get('/blogs/:category', (req, res) => {
    const category = req.params.category;
    const blogsFilePath = path.join(__dirname, 'public', 'blogs', category, 'blogs.json');
    if (fs.existsSync(blogsFilePath)) {
        const blogs = JSON.parse(fs.readFileSync(blogsFilePath));
        res.json(blogs);
    } else {
        res.json([]);
    }
});

// Serve the user homepage
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the admin homepage
app.get('/admin456', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});


app.get('/', (req, res) => {
    res.redirect('/user');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});