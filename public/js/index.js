// Menu Bar Controller
(function menuBar(){
const barContainer = document.querySelector(".menu-bar");
const bars = document.querySelectorAll(".bar");
const navbarContainer = document.querySelector(".navbar-container");
barContainer.addEventListener("click", (e) => {
    bars.forEach(bar => {
        bar.classList.toggle("change");
        navbarContainer.classList.toggle("show")
    })
})    
})();
// Checking for Authentication
const isAuth = (user) => {
    const navbarContainer = document.querySelector(".navbar-container");
    if(user){
        let html =`
        <div class="nav-links left-links">
            <button class="home">Home</button>
            <button class="post">Post</button>
        </div>
        <div class="nav-links right-links">
            <button class="logout">Logout</button>
            <button class="account">Account</button>
        </div>`;
        return navbarContainer.innerHTML = html;
    } else {
        let html =`
        <div class="nav-links left-links">
            <button class="home">Home</button>
        </div>
        <div class="nav-links right-links">
            <button class="login">Login</button>
            <button class="register">Register</button>
        </div>`;
        return navbarContainer.innerHTML = html;
    }
}
// Reference
const loginWrapper = document.querySelector(".login-wrapper");
const registerWrapper = document.querySelector(".register-wrapper");
const postWrapper = document.querySelector(".post-wrapper");
const editPostWrapper = document.querySelector(".edit-post-wrapper");
const readMoreWrapper = document.querySelector(".read-more-wrapper");
const allPostContainer = document.querySelector(".all-post-container");
const messageContainer = document.querySelector(".message-container");
// Authentication
firebase.auth().onAuthStateChanged(user => {
    if(user){
        isAuth(user);
        afterAuth();
        firebase.firestore().collection("posts").onSnapshot(snapshot => {
            getAllPost(snapshot.docs);
        });
    } else {
        isAuth(user);
        authUser();
        firebase.firestore().collection("posts").onSnapshot(snapshot => {
            getAllPost(snapshot.docs);
        });
    }
});
// General function for closing wrappers
const closeWrapper = (wrapperName, className, dispType) => {
    wrapperName.addEventListener("click", (e) => {
        if(e.target.className == className){ 
            allPostContainer.style.display = "flex";
            return wrapperName.style.display = dispType;
        }
    });
}
// Function for button close
const closeButton = (wrapperName) => {
     if(wrapperName == messageContainer){
        wrapperName.querySelector(".close").addEventListener("click", (e) => {
            return wrapperName.style.display = "none";
        });
    } else {
        wrapperName.querySelector(".close").addEventListener("click", (e) => {
            allPostContainer.style.display = "flex";
            return wrapperName.style.display = "none";
        });
    }
} 
// Get all post function 
const getAllPost = (posts) => {
    let html = ``;
    if(posts.length > 0){
        posts.forEach(post => {
            html +=`
            <div class="post-container">
                <div class="post-img"><img src="${post.data().imageURL}" alt="Image Here..."></div>
                <div class="post-body">
                    <h4 class="post-title">${post.data().title}</h4>
                    <p class="post-content">${post.data().content.length > 30 ? post.data().content.substring(0, 30) + "..." : post.data().content}</p>
                    <button data-id="${post.id}" class="m-bt-n read-more">Read More</button>
                </div>
            </div>`;
        });
    }
    allPostContainer.innerHTML = html;
    // Close read more wrapper
    closeWrapper(readMoreWrapper, "read-more-wrapper", "none");
    return readMoreFunction();
}
// Check if authenticated
const afterAuth = () => {
    // Post button
    const post = document.querySelector(".post");
    post.addEventListener("click", (e) => {
        allPostContainer.style.display = "none";
        postWrapper.style.display = "flex";
        // Close post wrapper
        closeWrapper(postWrapper, "post-wrapper", "none");
        closeButton(postWrapper);
    });
    // Logout button
    const logout = document.querySelector(".logout");
    logout.addEventListener("click", (e) => {
        if(firebase.auth().currentUser){
            return firebase.auth().signOut().then(() => successMessage("Logged out successfully"))
            .catch(err => errorMessage(err.message));
        } else {
            return errorMessage("You are not logged in either");
        }
    });
    // Account button
    const account = document.querySelector(".account");
    account.addEventListener("click", (e) => {
        if(firebase.auth().currentUser){ successMessage(`Logged in as "${firebase.auth().currentUser.email}"`);}
        else { return errorMessage("You are not logged in either"); }
    });
}
// Authenticated User
const authUser = () => {
    // All login buttons
    const loginButtons = document.querySelectorAll(".login");
    loginButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            registerWrapper.style.display = "none";
            allPostContainer.style.display = "none";
            loginWrapper.style.display = "flex";
            // Close login wrapper
            closeWrapper(loginWrapper, "login-wrapper", "none");
            closeButton(loginWrapper);
        });
    })
    // All register buttons
    const registerButtons = document.querySelectorAll(".register");
    registerButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            loginWrapper.style.display = "none";
            allPostContainer.style.display = "none";
            registerWrapper.style.display = "flex";
            // Close register wrapper
            closeWrapper(registerWrapper, "register-wrapper", "none");
            closeButton(registerWrapper);
        })
    })
}
// Login Form
const loginForm = document.querySelector("#loginForm");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    if(!email || !password){
        return errorMessage("All fields are required");
    }
    return firebase.auth().signInWithEmailAndPassword(filter_injection(email), filter_injection(password))
    .then(result => {
        loginForm.reset();
        loginWrapper.style.display = "none";
        allPostContainer.style.display = "flex";
        return successMessage(`Welcome ${result.user.email}`);
    })
    .catch(err => errorMessage(err.message));
});
// Register Form
const registerForm = document.querySelector("#registerForm");
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = registerForm.email.value;
    const password = registerForm.password.value;
    const vpassword = registerForm.vpassword.value;
    if(!email || !password || !vpassword){ return errorMessage("All field are required");}
    if(password != vpassword){ return errorMessage("Password does not match"); }
    return firebase.auth().createUserWithEmailAndPassword(filter_injection(email), filter_injection(password))
    .then(() => {
        successMessage("Account created successfully");
        registerForm.reset();
        registerWrapper.style.display = "none";
        return allPostContainer.style.display = "flex";
    })
    .catch(err => errorMessage(err.message));
});
// Post Form
const postForm = document.querySelector("#postForm");
postForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = postForm.title.value;
    const imageURL = postForm.imageURL.value;
    const content = postForm.content.value;
    if(!title || !imageURL || !content){ return errorMessage("All fields are required"); }
    return firebase.firestore().collection("posts").add({
        author: firebase.auth().currentUser.email, 
        title: filter_injection(title), 
        imageURL: filter_injection(imageURL), 
        content: filter_injection(content)
    }).then(() => {
        successMessage("Post added successfully");
        postForm.reset();
        postWrapper.style.display = "none";
        return allPostContainer.style.display = "flex";
    }).catch(err => errorMessage(err.message));
});
// Read More Buttons
const readMoreFunction = () => {
    const readMore = document.querySelectorAll(".read-more");
    readMore.forEach(readmore => {
        readmore.addEventListener("click", (e) => {
            const post_id = e.target.attributes["data-id"].value;
            return firebase.firestore().collection("posts").doc(post_id).get()
            .then(post => {
                let html =`
                <div class="m-container">
                    <div class="post-img">
                        <img src="${post.data().imageURL}" alt="Image Here..." />
                    </div>
                    <div class="post-body">
                        <h4 class="post-title">${post.data().title}</h4>
                        <p class="post-content">${post.data().content}</p>
                        ${postOwnership(post)}
                    </div>
                </div>
                `;
                readMoreWrapper.innerHTML = html;
                successMessage("To exit, click outside the container");
                allPostContainer.style.display = "none";
                readMoreWrapper.style.display = "flex";
                // Edit and Delete Post Here...
                return editAndDeletePost();
            })
            .catch(() => {});
        })
    });
}
// Edit and delete post
const editAndDeletePost = () => {
    // Edit Post 
    const editPost = document.querySelector(".editPost");
    editPost.addEventListener("click", (e) => {
        const post_id = editPost.attributes["data-id"].value;
        return firebase.firestore().collection("posts").doc(post_id).get()
        .then(post => {
            let html = `
            <div class="m-container">
                <div class="m-header">Edit Post <div class="close">x</div></div>
                <div class="m-body">
                    <form id="editedPostForm" data-id="${post.id}">
                        <input class="m-input" type="text" name="title" 
                        value="${post.data().title}"
                        placeholder="Title..." />
                        <input class="m-input" type="text" name="imageURL" 
                        value="${post.data().imageURL}"
                        placeholder="ImageURL..." />
                        <textarea name="content">${post.data().content}</textarea>
                        <input class="m-bt" type="submit" value="Submit" />
                    </form>
                </div>
            </div>`;
            editPostWrapper.innerHTML = html;
            readMoreWrapper.style.display = "none";
            allPostContainer.style.display = "none";
            editPostWrapper.style.display = "flex";
            getEditedPostForm();   
            // Close edited post wrapper
            closeWrapper(editPostWrapper, "edit-post-wrapper", "none");
            closeButton(editPostWrapper);   
        }).catch(err => errorMessage(err.message));
    })

    // Delete Post 
    const deletePost = document.querySelector(".deletePost");
    deletePost.addEventListener("click", (e) => {
        const post_id = deletePost.attributes["data-id"].value;
        return firebase.firestore().collection("posts").doc(post_id).delete()
        .then(() => {
            successMessage("Post deleted successfully");
            readMoreWrapper.style.display = "none";
            return allPostContainer.style.display = "flex";
        })
        .catch(err => console.log(err.message));
    })
}
// Post Ownership
const postOwnership = (post) => {
    if(firebase.auth().currentUser && firebase.auth().currentUser.email == post.data().author){
        return `
        <button data-id="${post.id}" class="m-bt-n editPost">Edit</button>
        <button data-id="${post.id}" class="m-bt-n deletePost">Delete</button>`;
    } else {
        return ``;
    }
}
// Get the edited post form submission
const getEditedPostForm = () => {
    const editedPostForm = document.querySelector("#editedPostForm");
    editedPostForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = editedPostForm.title.value;
        const imageURL = editedPostForm.imageURL.value;
        const content = editedPostForm.content.value;
        const post_id = editedPostForm.attributes["data-id"].value;
        return firebase.firestore().collection("posts").doc(post_id).get()
        .then(post => {
            firebase.firestore().collection("posts").doc(post_id).update({
                title: filter_injection(title) || post.data().title,
                imageURL: filter_injection(imageURL) || post.data().imageURL,
                content: filter_injection(content) || post.data().content
            }).then(() => {
                successMessage("Post updated.");
                editPostWrapper.style.display = "none";
                return allPostContainer.style.display = "flex";
            })
            .catch(err => errorMessage(err.message));
        })
        .catch(err => errorMessage(err.message));
    });
}
// Success Message
const successMessage = (message) => {
    let html =`
        <div class="message bg-success">
            <div><p class="p">${message}</p> <div class="close">x</div></div>
        </div>`;
    messageContainer.innerHTML = html;
    messageContainer.style.display = "flex";
    closeButton(messageContainer);
    setTimeout(() => {
        return messageContainer.style.display = "none";
    }, 5000);
}
// Error Message
const errorMessage = (message) => {
    let html =`
        <div class="message bg-error">
            <div><p class="p">${message}</p> <div class="close">x</div></div>
        </div>`;
    messageContainer.innerHTML = html;
    messageContainer.style.display = "flex";
    closeButton(messageContainer);
    setTimeout(() => {
        return messageContainer.style.display = "none";
    }, 5000);
}
// Filter cross site scripting
const filter_injection = (string_name) => {
    let stage_1_pattern = /<script>/ig;
    let stage_2_pattern = /<\/script>/ig;
    let result1 = string_name.replace(stage_1_pattern, "");
    let result2 = result1.replace(stage_2_pattern, "");
    return result2;
}