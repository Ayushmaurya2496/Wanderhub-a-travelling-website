# 🌍 Wanderlust - Travel Explorer Web App

**Wanderlust** is a dynamic travel-based web application designed to inspire and assist users in discovering amazing travel destinations across the world. Built using **Node.js**, **Express**, **MongoDB**, and **EJS**, this project is ideal for learning full-stack development while exploring the world virtually.

---

##  Features

-  Search and discover beautiful travel locations
-  View detailed pages of destinations with images and descriptions
-  Add your own custom places (CRUD operations)
-  User authentication (Register/Login)
-  Comment and review system (Optional Add-on)
-  Responsive and simple UI using EJS templating

---

##  Tech Stack

| Technology | Description |
|------------|-------------|
| `Node.js`  | Backend runtime environment |
| `Express.js` | Web application framework |
| `MongoDB` + `Mongoose` | NoSQL database & ODM |
| `EJS` | Server-side templating |
| `Passport.js` | Authentication |
| `dotenv` | Environment variables |
| `Bootstrap` or custom CSS | Styling |

---


WanderLust is my first full-stack web development project, inspired by my love for exploring and learning. It took me almost 6 months to understand different web components and technologies — from frontend frameworks to backend integration, database management, and user authentication.

This project represents not only my technical growth but also my dedication to building something meaningful from scratch. Every feature you see here has been a result of multiple trials, hours of debugging, and countless cups of chai! ☕


# NOTE: If you want MongoDB Atlas, paste your Atlas URI here.
# If your network/DNS blocks SRV lookups, use the non-SRV URI (starts with mongodb:// not mongodb+srv://).
#Based on your current project, it already has the core foundation of a travel listing app. The next features should focus on making it more useful, scalable, and closer to a real-world platform.

What you already have
- Travel listing pages
- Add/edit/delete listing
- User login/signup
- Reviews/comments
- Image upload support
- Search and listing detail pages
- Flash messages and session-based auth

So the app is already strong in the “basic product” stage.

Best next features to add
1. Better search and filters
- Search by city, country, price, type, rating
- Filter by budget, season, activities
- Sort by newest/popular/cheapest
- This is the most necessary feature because users need to find places fast

2. Wishlist / favorites
- Add places to “Saved” or “Wishlist”
- User-specific saved listings
- Helps with engagement and repeat visits

3. Booking / reservation flow
- Allow users to book a place or request a trip
- Date selection, guest count, pricing summary
- This turns your app from a directory to a real booking platform

4. Ratings and review improvements
- Average rating calculation
- Rating stars
- Review moderation
- Helpful filters like “best rated”, “family friendly”
- Current review system is good, but better analytics would improve trust

5. User profile and dashboard
- Profile with saved trips, posted listings, liked places
- Travel history and upcoming bookings
- Makes the platform more personal

6. Map integration
- Show locations on a map
- Pin destinations on Google Maps / Mapbox
- Very useful for travel apps

7. Admin panel
- Approve listings
- Remove fake reviews
- Manage users
- Important for production quality

8. Pagination and homepage improvements
- Show limited listings per page
- Featured destinations
- Categories like Beaches, Mountains, Cities, Adventure
- Improves UX and performance

9. Notifications / email
- Confirm booking
- Registration success
- New review or listing approval
- Helps with user retention

10. AI-powered recommendations
- “Places you may like”
- Based on user preferences and previous searches
- Good long-term differentiator

Priority order for your project
If you want the most necessary 5 to add first:
1. Search + filters
2. Wishlist/favorites
3. Booking system
4. User dashboard/profile
5. Map integration

Most important for growth
The single biggest missing feature is a “complete user journey”:
- search destination
- save favorite
- view details
- book or plan trip
- track profile/activity

That will make the app feel like a real product, not just a learning project.

My recommendation
For your current stage, I would add:
- Advanced listing filters
- Wishlist
- Booking flow
- Ratings improvement
- User profile

These are the most practical and useful next steps.

If you want, I can also:
- suggest a feature roadmap for your project
- rank features by difficulty and impact
- create a list of exact modules to implement in your existing app structure






Updated todo list

User profile mein ye sections useful rahenge:

**Already added**
- Username
- Email
- Total listings count
- Saved places count
- User ki apni listings
- Saved places

**Next important additions**

1. **Profile photo**
   - User avatar upload
   - Default initials/avatar

2. **Edit profile**
   - Username update
   - Email update
   - Bio/about me
   - Profile photo change

3. **Travel activity**
   - Recent reviews
   - Reviews given by user
   - Recently viewed listings

4. **Booking information**
   - Upcoming bookings
   - Past bookings
   - Booking status

5. **Travel preferences**
   - Favorite destination
   - Budget range
   - Preferred category: beach, mountain, city, adventure
   - Preferred travel season

6. **User’s reviews**
   - Rating given
   - Comment
   - Related listing
   - Review date

7. **Account settings**
   - Change password
   - Email preferences
   - Delete account
   - Logout from all devices

8. **Trust and safety**
   - Account creation date
   - Verified email badge
   - Number of listings/reviews
   - Report user option

**Recommended priority:**

1. Edit profile and bio  
2. Profile photo  
3. User reviews  
4. Booking history  
5. Travel preferences  
6. Account settings  

Profile ko overcrowd na karne ke liye sections ko tabs mein divide kar sakte hain:

- **Overview**
- **My Listings**
- **Saved Places**
- **My Reviews**
- **Bookings**
- **Settings**