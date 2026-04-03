-- ============================================================
-- Update About Us and Privacy Policy content
-- Run in Supabase SQL Editor
-- ============================================================

UPDATE site_content SET body = '<div>
<p>The Sri Sathya Sai Center at Houston is an independent and autonomous 501(c)(3) non profit organization and is named after the organization''s founder, Sri Sathya Sai Baba. Although we operate independently, we are affiliated to Sri Sathya Sai Central Trust which has been in existence since the early 70''s and the Sri Sathya Sai Global Council. We are a non-denominational, non-religious, purely spiritual and service-oriented community of seekers, inspired by the teachings of Sathya Sai Baba. We welcome all spiritual seekers irrespective of their background and religious affiliation. Participation in our activities is purely voluntary and is open to all. There are no fees of any kind to join or participate in the activities.</p>

<p>We meet at <strong>Kids ''R'' Kids Learning Academy of Cardiff Ranch, 4515 FM 1463, Katy, TX 77494</strong> for our Devotional and Educare activities.</p>

<p><a href="/login">Contact us</a> &nbsp; | &nbsp; <a href="/seva">Volunteer with us</a></p>

<h2>We conduct 3 major activities – Devotional, Service and Education</h2>

<h3>Devotional activity</h3>
<p>Every week our members congregate to in devotional sessions for about 3 hrs. A topic of spiritual interest is taken from Sri Sathya Sai Literature and discussed to see how we could apply it to real life situations. We conduct Bhajan sessions (a form of congregational singing and bonding, that gives our members an opportunity to immerse in music-driven spiritual and liturgical experience) and also conduct free training workshops. We also conduct multi faith prayer sessions and learn various prayers and their history.</p>
<p><a href="/devotion">Go To Devotional Page</a></p>

<h3>Service activity</h3>
<p>We conduct several community service activities on an ongoing basis and have partnered with several soup kitchens and homeless shelters in the greater Houston area. We come together as a group to take home-cooked food to downtown shelters, we make brown bag lunches, stock the shelter pantries, rescue food from grocery stories, bakeries etc. and bring them to the shelters. We organize special programs for nursing homes and detention centers for volunteers to spend time with the needy in counselling and providing emotional support. Our food rescue and distribution activities are weekly and our special programs are monthly. We assess the needs of rural communities partnering with the local pantries and churches and then collect supplies through drives and conduct events to distribute them in those communities on a quarterly basis. We also help tutoring and procuring school supplies for schools in underserved areas and conduct health camps and provide health education to those that have poor access to health care and do this one to two times a year.</p>
<p><a href="/seva">Go To Service Page</a></p>

<h3>Educare activity</h3>
<p>We conduct Spiritual education for children between the ages of 5 and 18. These classes are offered both in person and remotely, mostly, to the children of members and open for anyone in this age group. The regular classes are held weekly once when the schools are in session. The teachers are all volunteer members of the congregation and we have a robust curriculum and teacher training and certification program. The entire program rests on 2 foundations: <strong>1) God Exists</strong> <strong>2) Man is Divine</strong>.</p>
<p>The program is based on the philosophy of Educare which means "to bring out that which is within", namely, the human values hidden in every human being: <em>truth, righteousness, peace, love, and nonviolence</em>. One cannot acquire them from outside; they have to be elicited from within. However, people have forgotten their innate human values, so they are unable to manifest them. Educare means to bring out the human values. To bring them out means to translate them into action.</p>
<p><a href="/educare">Go To Educare Page</a></p>
</div>'
WHERE page_key = 'about';


UPDATE site_content SET body = '<div>
<h2>Who we are</h2>
<p>Our website address is: <a href="https://www.sssgc-houston.org">https://www.sssgc-houston.org</a>.</p>

<h2>Comments</h2>
<p>When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor''s IP address and browser user agent string to help spam detection.</p>
<p>An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: <a href="https://automattic.com/privacy/">https://automattic.com/privacy/</a>. After approval of your comment, your profile picture is visible to the public in the context of your comment.</p>

<h2>Media</h2>
<p>If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.</p>

<h2>Cookies</h2>
<p>If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.</p>
<p>If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.</p>
<p>When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.</p>
<p>If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.</p>

<h2>Embedded content from other websites</h2>
<p>Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.</p>
<p>These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.</p>

<h2>Who we share your data with</h2>
<p>If you request a password reset, your IP address will be included in the reset email.</p>

<h2>How long we retain your data</h2>
<p>If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.</p>
<p>For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.</p>

<h2>What rights you have over your data</h2>
<p>If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.</p>

<h2>Where your data is sent</h2>
<p>Visitor comments may be checked through an automated spam detection service.</p>
</div>'
WHERE page_key = 'privacy';
