
    
//localStorage = זיכרון משתמש
// בדיקה בכל פעם שהדף נטען אם מזהה משתמש קיים
if(localStorage.getItem('login_string')){
    login_string = localStorage.getItem('login_string');

    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "login_string": login_string
        }),
        redirect: 'follow'
    };
    fetch("http://127.0.0.1:2000/check/user", requestOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        console.log(result);
        if(result.coll.status){
            // Handle the successful result here
            console.log(result);
            var user_show = document.getElementById('user_show');
            user_show.innerHTML = '!' + result.coll.findQuery.username + ' שלום ';
            if(result.coll.findQuery.permissions == 1){
                document.getElementById('newCoupon').style.display = "block";
                document.getElementById('UpsertUserButtonMenu').style.display = "initial";
                document.getElementById('newResButtonMenu').style.display = "initial";
            }
            

            

        }else{
            alert("Login failed. Please check your credentials.");
            
                window.location.href = '/login.html';
        }
    })
    .catch(error => {
        // Handle errors here
        console.log('Error:', error);
    });
}else{
    window.location.href = '/login.html';
}


// Get the URL query parameters
const urlParams = new URLSearchParams(window.location.search);

// Get a specific query parameter by name
const type = urlParams.get('type'); // Returns type value
const idres = urlParams.get('id'); // Returns id value
//שימוש בה על פי ערך של type




//פונקצייה שעוברת על מערך של כל סוגי הדפים ומציגה רק את הדף הרלוונטי
function showAndHidePage(pageToShow){
    const pages = [];
    pages[0] = 'listPage';
    pages[1] = 'homePage';
    pages[2] = 'resPage';
    pages[3] = 'newResPage';
    pages[4] = 'UpsertUserPage';
    pages.forEach(item => {
        if(item == pageToShow){
            document.getElementById(item).style.display = "block";
            console.log(item)
        }else{
            document.getElementById(item).style.display = "none";
        }
    }); 				
}


showAndHidePage(type);



/*
----------------------------------------------------
------------ עלאת קבצים אוטמטים - התחלה // -----------

*/
const imagesToSend = []
const inputElement = document.querySelector('input[type="file"]');

inputElement.addEventListener('change', async (event) => {
    
    const file = event.target.files[0]; // Get the selected file
    console.log(file.name);
    

    imagesToSend.push('public/images/' + file.name);
    console.log(imagesToSend);
    
    if (file) {
        const formData = new FormData();
        formData.append('image', file); // Attach the file to the FormData

        try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Image uploaded successfully.');
        } else {
            console.error('Image upload failed.');
        }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

/*
----------------------------------------------------
------------ עלאת קבצים אוטמטים - סוף // -----------

*/

/*
................................................................................................................................................
////////////////// דף מסעדה - התחלה ////////////////////////////////////////////////////////////////////////////////////////////////////////////
*/

if(type == "resPage"){




    //כפתור הוספת קופון חדש  
    document.getElementById("addCouponButton").addEventListener('click', () => {
    
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const NewCouponName = document.getElementById('NewCouponName').value;
        const NewCouponType = document.getElementById('NewCouponType').value;
        const NewCouponAmount = document.getElementById('NewCouponAmount').value;

        var raw = JSON.stringify({
            
                "login_string": login_string,
                "newCouponInfo": {
                    "name": NewCouponName,
                    "type": NewCouponType,
                    "amount": NewCouponAmount,
                    "restaurant_id": idres
                }
            
        });
        
        
        // הכנת הבקשה
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        // שליחת הבקשה
        fetch("http://127.0.0.1:2000/insert/coupons", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {

            if(result.coll != null){
                location.reload();


            // Handle the successful result here
            console.log(result.coll); //מציג בטסטים
            alert(result.coll.msg)
        
            }else{
                alert("Login failed. Please check your credentials.");
            }
        })
    });



    //  כפתור בדיקת קופון
    document.getElementById("checkCouponButton").addEventListener('click', function() {

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const checkCouponName = document.getElementById('checkCouponName').value;
        var raw = JSON.stringify({
                "name": checkCouponName,
                "restaurant_id": idres
            
        });
        
        
        // הכנת הבקשה
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        // שליחת הבקשה
        fetch("http://127.0.0.1:2000/find/coupons", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            console.log(result.coll); 
            if(result.coll != null){
                
                document.getElementById("checkContainer").innerHTML = '<span style="font-weight: bold;">name:</span>' +result.coll.name+ '<br /><span style="font-weight: bold;">Type:</span>' + result.coll.type + '<br /><span style=" font-weight: bold;">Amount: </span>' + result.coll.amount;

            // Handle the successful result here
            console.log(result.coll); //מציג בטסטים
            
            //alert(result.coll.msg)
        
            }else{
                alert("not found");
            }
        })
    });




        // שליפת מזהה מסעדה והנתונים שלה
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "login_string": login_string,
            "id": idres
        });

        // הכנת הבקשה
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        // שליחת הבקשה
        fetch("http://127.0.0.1:2000/findById/list", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {

            if(result.coll != null){
                document.getElementById("title").innerHTML = result.coll.qFindById.resrestaurant_name;
                document.getElementById("image").src =  result.coll.qFindById.image;

            // Handle the successful result here
            console.log(result.coll); //מציג בטסטים
        
            }else{
                alert("Page not found");
                window.location.href = '/';
            }
        })
        
        // שליפת חוות דעת
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "restaurant_id": idres
        });
        // הכנת הבקשה
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        // שליחת הבקשה
        fetch("http://127.0.0.1:2000/reviews_and_users/list", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {

            if(result.coll != null){
            // Handle the successful result here
            console.log("מערך תצוגה"); //מציג בטסטים
            console.log(result.coll); //מציג בטסטים

                listArr= result.coll
                // Loop through the array and create HTML elements
                htmlList = '';

                /*
                rateAll
                    ---- המערך מחולק ל5 תאים, כל תא מציין סכום של ביקורת, למשל אם יש 3 ביקרות של 2 אז הערך של התא ה-2 הוא 3
                    עבור chart js
                    לכמות ביקורות
                */
                rateAll = [0,0,0,0,0];

                

                listArr.forEach(item => {
                    
                    htmlList += `
                    <div class="recommendation">
                        <h2>${item.users.username}</h2>
                    `;

                        for(i = 1; i <= item.rate; i++){
                            htmlList += `⭐`;
                        }

                        
                        rateAll[item.rate-1] += 1;

                        htmlList += `
                        <p class="rating"> ${item.rate}/5</p>
                        <p>${item.title}</p>
                        <p>${item.body}</p>`;

                        const imageReview = item.images;
                        if(imageReview != null){
                            imageReview.forEach(itemImage => {
                                htmlList += `<img src="${itemImage}">`;
                            })
                        }
                    
                    htmlList += `
                    </div>
                    `;
                
                });
                document.getElementById('reviewsshow').innerHTML = htmlList





                /*
                ---------------------------------------------
                ------------ התחלה - chart js //  -----------
                
                */
        
                
                        // שמות עמודות
                        const labels = [
                            '★ Poor',
                            '★★ Below',
                            '★★★ Average',
                            '★★★★ Good',
                            '★★★★★ Excellent'
                        ];


                        const data = {
                            labels: labels,
                            datasets: [{
                                label: 'My First Dataset',
                                data: rateAll,
                                // צבעים
                                backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(255, 205, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(201, 203, 207, 0.2)'
                                ],
                                borderColor: [
                                'rgb(255, 99, 132)',
                                'rgb(255, 159, 64)',
                                'rgb(255, 205, 86)',
                                'rgb(75, 192, 192)',
                                'rgb(54, 162, 235)',
                                'rgb(153, 102, 255)',
                                'rgb(201, 203, 207)'
                                ],
                                borderWidth: 1
                            }]
                        };
                        const config = {
                            type: 'bar',
                            data: data,
                            options: {
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                            },
                        };
                        
                        const ctx = document.getElementById('myChart'); // הדפסה

                        new Chart(ctx, config);



                        
                    }else{
                        alert("failed. Please check your credentials.");
                    }
                })
            /*
            ------------ סוף - chart js // -----------
            ---------------------------------------------
            */
        

        


        /*
        ----------------------------------------------------
        ------------ הוספת ביקורות - התחלה // -----------
        */
        document.getElementById("addReview").addEventListener("click", () => {
            login_string = localStorage.getItem('login_string');
            const currentUnixTimestampSeconds = Math.floor(Date.now() / 1000);
            var recommendationReview = document.getElementById("recommendationReview").value;
            var ratingReview = document.getElementById("ratingReview").value;
            var titleReview = document.getElementById("titleReview").value;

            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "restaurant_id": idres,
                "login_string": login_string,
                "title": titleReview,
                "body": recommendationReview,
                "date": currentUnixTimestampSeconds,
                "rate": ratingReview,
                "images": imagesToSend
            });
            console.log(raw)
            

            var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
            };

            fetch("http://127.0.0.1:2000/insert/reviews", requestOptions)
            .then(response => response.text())
            .then(result => {
                location.reload();

            })
            .catch(error => console.log('error', error));

        });
        /*
        ----------------------------------------------------
        ------------ הוספת ביקורות - סוף // -----------
        */
/*
////////////////// דף מסעדה - סוף ///////////////////////////////////////
.........................................................................
*/







/*
........................................................................
////////////////// דף רשימת מסעדות - התחלה/////////////////////////////////
*/
}else if(type == "listPage"){

        /*
        ---------------------------------------------------------
        ------------ פילטור הדף על פי type - התחלה // -----------
        */



        
        // הסיבה לשימוש בפוקנציה בגלל שהמשנה דינאמי ועשוי להפעיל את הבקשה טרם המשנה קיבל ערך
        async function request_list(bodyReq){
            // הכנת מידע שישלח לבקשה
            var requestOptions = await {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                // body משתנה בהתאם
                body:  JSON.stringify(bodyReq),
                redirect: 'follow'
            };	

            // הבקשה
            fetch("http://127.0.0.1:2000/findMany/list", requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(result => {

                    if(result.coll != null){
                    // Handle the successful result here
                    console.log(result.coll); //מציג בטסטים

                    var list_show = document.getElementById('listShow');
                        listArr= result.coll
                        // Loop through the array and create HTML elements
                        htmlList = '';
                        listArr.forEach(item => {
                            
                            htmlList += `
                            
                                    
                                    <a href="/?type=resPage&id=${item._id}">
                                        <div class="featured">
                                            <img src="${item.image}" style="width: 250px" alt=""/>
                                        </div>
                                        <div>
                                            <h2>${item.resrestaurant_name}</h2>
                                        </div>
                                        
                                    </a>
                                    <hr class="styled-line">


                            `;
                        
                        });
                        list_show.innerHTML = htmlList
                    }else{
                        alert("page not found");
                        window.location.href = '/';
                    }
                })

        }


        // בודקים אם יש סאבטייפ עבור קטגורים במידה ולא אז נעשה כל המסעדות לבקשת body
        if(urlParams.get('sub_type')){
                // הסיבה לשימוש בפוקנציה בגלל שהמשנה דינאמי ועשוי להפעיל את הבקשה טרם המשנה קיבל ערך
            const bodyReq = {
                "categories.type": urlParams.get('sub_type')
            }
            request_list(bodyReq)
        }else{
            const bodyReq = {}
            request_list(bodyReq)
        }
        
        
        
/*
////////////////// דף רשימת מסעדות - סוף/ ///////////////////////////////////////
.........................................................................
*/


/*
........................................................................
////////////////// דף הוספת מסעדה - התחלה /////////////////////////////////


-----------------------------------------------------------------------------------------------------------------------------
    😛 !חשוב ! גם אם מוצג הוספה למרות שלא או המשתמש ינסה להוסיף בדרך מתוחכמת, לא אומר שאותו משתממש יכול להוסיף ! כי אין לו הרשאות 
----------------------------------------------------------------------------------------------------------------------------

*/

}else if(type == "newResPage"){
    

    document.getElementById("addResButton").addEventListener("click", () => {

        const name = document.getElementById("name").value;
        const imageURL = document.getElementById("imageURL").value;
        const bodyRes = document.getElementById("bodyRes").value;
        const categories = document.getElementById("cat").value;
        
        
            // הכנת מידע שישלח לבקשה
            var requestOptions = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body:  JSON.stringify({
                    "login_string": login_string,
                    "newResInfo": {
                        "resrestaurant_name": name,
                        "image": imageURL,
                        "categories": {
                            "type": categories
                        },
                        "body": bodyRes								}
                }),
                redirect: 'follow'
            };	
            // הבקשה
            fetch("http://127.0.0.1:2000/insert/list", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(result => {
                console.log(result.coll);
                if(result.coll != null){
                    // Handle the successful result here
                    console.log(result.coll); //מציג בטסטים
                    alert("מסעדה חדשה נוספה!");
                }
            })
        });
/*
////////////////// דף הוספת מסעדה - סוף /////////////////////////////////
.........................................................................
*/


/*
........................................................................
////////////////// דף הוספת מסעדה משתמש - התחלה /////////////////////////////////


--------------------------------------------------------------------------------------------------------------------------
    😛 !חשוב ! גם אם מוצג הוספת משתמש או המשתמש ינסה להוסיף בדרך מתוחכמת, לא אומר שאותו משתממש יכול להוסיף ! כי אין לו הרשאות 
--------------------------------------------------------------------------------------------------------------------------

*/
}else if(type == "UpsertUserPage"){
    

document.getElementById("buttonUserUpsert").addEventListener("click", () => {

    const usernmaeUserUpsert = document.getElementById("usernmaeUserUpsert").value;
    const permissionsUserUpsert = document.getElementById("permissionsUserUpsert").value;
    const passwordUserUpsert = document.getElementById("passwordUserUpsert").value;

    async function request_upsert_user(upsertBody){
        // הכנת מידע שישלח לבקשה
        var requestOptions = await {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body:  JSON.stringify(upsertBody),
            redirect: 'follow'
        };

            // הבקשה
            fetch("http://127.0.0.1:2000/insert/admin", requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(result => {
                    console.log(result); 
                    if(result.coll != null){
                        // Handle the successful result here
                        alert(result.coll.msg);
                        console.log(result.coll); 
                    }else{
                        alert(result.coll.msg);
                    }
                })
        }
    

        // פה אנחנו רוצות לבדוק אם הוא שם משהו בסיסמה בממידה ולא לא יהיה סיסמה או שלא תתעדכן
        if (passwordUserUpsert === '') {
            const upsertBody = {
                "login_string": login_string,
                "newUserInfo": {
                    "username": usernmaeUserUpsert,
                    "permissions": permissionsUserUpsert
                }
            }
            request_upsert_user(upsertBody);
        }else{
            const upsertBody = {
                "login_string": login_string,
                "newUserInfo": {
                    "username": usernmaeUserUpsert,
                    "permissions": permissionsUserUpsert,
                    "password": passwordUserUpsert
                }
            }
            request_upsert_user(upsertBody);
        }

    });

}else{
        const homePage = document.getElementById('homePage');
        homePage.style.display = "block";

        
    }
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.setItem('login_string','');
        window.location.href = '/'; //טעינה חזרה לדף הראשי
    })
