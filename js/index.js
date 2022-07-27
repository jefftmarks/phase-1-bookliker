document.addEventListener("DOMContentLoaded", () => {

// Fetch requests

    // Fetch books
    fetch('http://localhost:3000/books')
    .then(res => res.json())
    .then(bookData => bookData.forEach(renderBookList))

    // Fetch users
    fetch('http://localhost:3000/users')
    .then(res => res.json())
    .then(userData => {
        usersArray = userData;
    })

// Render functions

    // Function to render book list
    function renderBookList (book) {
        // Nav list
        const ul = document.getElementById('list');
        const li = document.createElement('li');
        li.textContent = book.title;
        ul.appendChild(li);

        // Show panel
        const showPanel = document.getElementById('show-panel');
        const panelDiv = document.createElement('div')
        const thumbnail = document.createElement('img');
        const title = document.createElement('h1');
        const subtitle = document.createElement('h2');
        const author = document.createElement('h2');
        const description = document.createElement('p');
        const users = document.createElement('ul');
        const likeButton = document.createElement('button');

        panelDiv.id = book.id;
        panelDiv.className = 'panel-div';
        thumbnail.src = book.img_url;
        title.textContent = book.title
        subtitle.textContent = book.subtitle;
        author.textContent = book.author;
        description.textContent = book.description;
        users.id = `users-${book.id}`;
        likeButton.textContent = 'LIKE';

        book.users.forEach((element) => {
            const username = document.createElement('li');
            username.textContent = element.username;
            username.className = 'user'
            users.append(username);
        })

        panelDiv.append(thumbnail, title, subtitle, author, description, users, likeButton);
        showPanel.append(panelDiv);

        panelDiv.style.display = 'none';

        // Event listener to display book panel
        li.addEventListener('click', () => showBookInfo(book))
        // Event listener to handle user likes
        likeButton.addEventListener('click', () => {
            handleLikes(book);
        })
    }

    // Function to display book panel
    function showBookInfo(book) {
        const nodeList = document.querySelectorAll('.panel-div');
        const panelArray = Array.from(nodeList);
        panelArray.forEach((element) => {
            element.style.display = 'none';
        })

        const panel = document.getElementById(book.id);
        panel.style.display = 'block';
    }

    // Function to users on book panel
    function updateBookInfo(book) {
        const users = document.getElementById(`users-${book.id}`);
        const newListItem = document.createElement('li');

        // Find most recently add (last) users object in users array
        const x = book.users.length;
        const newUser = book.users[x - 1];
        const newUsername = newUser.username;

        newListItem.textContent = newUsername;

        // Need conditional to not add a new list item if all usernames are used
        if (newUsername) {
            users.appendChild(newListItem);
        }
    }


// Handle Likes

    // function to handle likes
    function handleLikes(book) {
        // Create empty array and populate with id values of current users who like book
        const id_likes = [];
        book.users.forEach(user => id_likes.push(user.id))

        // This variable will store the name of a username available to like the book
        let nextUser = {};

        // For each user in user databse, perform a function to return a false value for every user not currently in the current_likes array
        // Create a flag to track boolean value
        // Create conditional: if not flag (aka user has not liked book), update the value of next user, which after the end of the for each teration, will equal a value of a username available to like the book
        usersArray.forEach(userObj => {
            let flag = id_likes.find((num) => {
                return (userObj.id === num);
            })
            if (!flag) {
                nextUser = {"id": userObj.id, "username": userObj.username}
            }   
        })

        //Push next user into local array of users who like book
        book.users.push(nextUser);

        // PATCH request to server, send new array of users who like particular book
        fetch(`http://localhost:3000/books/${book.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({"users": book.users})
        })
        .then(res => res.json())
        .then(book => updateBookInfo(book))
        .catch(e => console.error(e))
    }

})

