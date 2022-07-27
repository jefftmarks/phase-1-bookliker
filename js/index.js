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
        const likeBtn = document.createElement('button');

        panelDiv.id = book.id;
        panelDiv.className = 'panel-div';
        thumbnail.src = book.img_url;
        title.textContent = book.title
        subtitle.textContent = book.subtitle;
        author.textContent = book.author;
        description.textContent = book.description;
        users.id = `users-${book.id}`;
        likeBtn.textContent = 'LIKE';
        likeBtn.id = `like-${book.id}`;

        book.users.forEach((element) => {
            const username = document.createElement('li');
            const deleteBtn = document.createElement('button')
            
            username.textContent = element.username;
            username.className = 'user';
            deleteBtn.textContent = 'x';
            deleteBtn.id = `delete-${book.id}-${element.username}`
            deleteBtn.style.marginLeft = '10px';

            username.append(deleteBtn);
            users.append(username);

            // Event listener to handle delete
            deleteBtn.addEventListener('click', () => handleDelete(book, element.username));
        })

        // Conditional to disable like button if all users have liked
        if (book.users.length >= 10) {
            likeBtn.disabled = true;
        }

        panelDiv.append(thumbnail, title, subtitle, author, description, users, likeBtn);
        showPanel.append(panelDiv);

        panelDiv.style.display = 'none';

        // Event listeners

            // Event listener to display book panel
            li.addEventListener('click', () => showBookInfo(book))

            // Event listener to handle user likes
            likeBtn.addEventListener('click', () => handleLikes(book))
    }


    // Function to display book panel
    let activePanel = null;

    function showBookInfo(book) {
        activePanel = book.id;
        const nodeList = document.querySelectorAll('.panel-div');
        const panelArray = Array.from(nodeList);
        panelArray.forEach((element) => {
            element.style.display = 'none';
        })

        const panel = document.getElementById(book.id);
        panel.style.display = 'block';
    }


    // Function to update users on book panel
    function updateBookInfo(book) {
        const users = document.getElementById(`users-${book.id}`);
        const newListItem = document.createElement('li');
        const deleteBtn = document.createElement('button');
        const likeBtn = document.getElementById(`like-${book.id}`);

        deleteBtn.style.marginLeft = '10px';

        // Conditional to disable like button if all users have liked
        if (book.users.length >= 10) {
            likeBtn.disabled = true;
        }

        // Find most recently added (last) user object in users array
        const x = book.users.length;
        const newUser = book.users[x - 1];
        const newUsername = newUser.username;

        newListItem.textContent = newUsername;
        deleteBtn.textContent = 'x';
        deleteBtn.id = `delete-${book.id}-${newUsername}`

        // Event listener to handle delete
        deleteBtn.addEventListener('click', () => handleDelete(book, newUsername));

        // Need conditional to not add a new list item if all usernames are used
        if (newUsername) {
            newListItem.append(deleteBtn);
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

        // For each user in user databse, perform a function to return a false value for every user not currently in the current_likes array (aka users who haven't liked book)
        // Create a flag to equal this boolean value for each user
        // Create conditional: if flag is false (aka user has not liked book), update the value of our next user variable, which after the end of the forEach() iteration, will equal the value of a username available to like the book
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
        .then(book => {
            updateBookInfo(book)
        })
        .catch(e => console.error(e))
    }


// Handle Delete

    function handleDelete(book, username) {
        
        let index = null;

        //find index of user to remove from array of users
        for(const element of book.users) {
            if (element.username === username) {
                index = book.users.indexOf(element)
            }
        }

        book.users.splice(index, 1);

        fetch(`http://localhost:3000/books/${book.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accepts': 'application/json'
            },
            body: JSON.stringify({"users": book.users})
        })
        .then(res => res.json())
        .then(book => {
            const deleteBtn = document.getElementById(`delete-${book.id}-${username}`);
            const likeBtn = document.getElementById(`like-${book.id}`);

            deleteBtn.parentNode.remove();
            likeBtn.disabled = false;
        })
    }



})

