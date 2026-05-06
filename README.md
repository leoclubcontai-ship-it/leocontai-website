# 🦁 Leo Club of Contai — Official Website

> **Est. 1980 | Sponsored by Lions Club of Contai | 74 Active Members**

A complete, modern website for Leo Club of Contai with Firebase backend, real-time database, photo storage, admin panel, and member portal.

## 🌐 Live Features

- **17 HTML pages** — fully responsive, high-end design
- **Firebase Firestore** — real-time cloud database
- **Firebase Storage** — real photo uploads
- **Firebase Authentication** — secure login with password reset
- **Admin Panel** — manage everything from the cloud
- **Member Portal** — upload projects, vote on polls, RSVP events

## 📄 Pages

| Page | Description |
|------|-------------|
| `index.html` | Home page with hero, stats, services, gallery preview |
| `about.html` | Club history, timeline, Leo International info |
| `service.html` | All 6 service categories with project links |
| `team.html` | Leadership team + 74 member grid (loads photos from Firebase) |
| `gallery.html` | Photo gallery with filter tabs and lightbox |
| `contact.html` | Contact form with captcha, Google Maps, contact numbers |
| `donate.html` | Donation page with amount selector |
| `member.html` | Membership application page |
| `project-blood.html` | Blood Donation projects (loads from Firebase) |
| `project-environment.html` | Environment projects |
| `project-education.html` | Education projects |
| `project-sports.html` | Youth Sports projects |
| `project-donation.html` | Donation Drive projects |
| `project-community.html` | Community projects |
| `member-login.html` | Firebase Auth login (Member + Admin tabs) |
| `member-portal.html` | Member dashboard — projects, events, polls |
| `admin-panel.html` | Full admin control panel |

## 🔥 Firebase Setup

1. Firebase project: **leo-wbsite**
2. Config is in `firebase-config.js`
3. Enable **Email/Password** authentication
4. Create Firestore database (test mode to start)
5. Enable Firebase Storage

### First Admin Account
Go to Firebase Console → Authentication → Add user:
- Email: `admin@leocontai.org`
- Password: your choice

Then in Firestore → `users` collection → add doc with user's UID:
```json
{
  "name": "Leo Admin",
  "email": "admin@leocontai.org",
  "role": "admin",
  "initials": "LA"
}
```

## 🎨 Design

- **Colors:** Navy `#0B1730` + Gold `#BF8C3C`
- **Fonts:** Cormorant Garamond (headings) + Plus Jakarta Sans (body)
- **Images:** Unsplash (free to use)

## 📞 Contact

- **Address:** Saraswatitala, Contai, Purba Medinipur, W.B. 721401
- **Phone:** +91 8710049344
- **Email:** info@leocontai.org
- **Facebook:** [facebook.com/leocontai](https://www.facebook.com/leocontai/)

---

*Built with ❤️ for Leo Club of Contai*
