document.addEventListener('DOMContentLoaded', () => {
    fetch('/blogs/sports')
        .then(response => response.json())
        .then(blogs => {
            const container = document.getElementById('blog-container');
            blogs.forEach(blog => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="blog-tile">
                        <img src="${blog.image}" alt="${blog.title}">
                        <h3>${blog.title}</h3>
                        
                        <a href="${blog.url}"><button class="btn">Read more</button></a>
                    </div>

                `;
                container.appendChild(card);
            });
        });
});
