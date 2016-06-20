# PickyEaters

This project uses npm. To install necessary dependencies, use "npm install".

To run this application, use "node app.js".

To run the crappy demo: Use "node app.js", then hit the /swoog endpoint using Postman/Advanced Rest Client/the browser. This'll dump some fake data into the database. Then, run "node testClientCaptain.js" to start the Captain's process, and "node testClientGroupMember" to start the group member's process. The group will then randomly veto restaurants round-robin until there is only one restaurant left.

Make sure you manually delete the stuff inside sessions.db after it's done to cleanup, as there's currently no cleanup step.
