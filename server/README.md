Workings * NOT YEH :(

On a POST hook from a git push to the main web repository, this program will create a build job in a redis queue, for building by the contained build server.
The build server checks for new jobs every minute, if a job exists it will proccess the job, pull the corresponding commits from the master repository, merge it with the internal build repository and package the code into a folder to be deployed to staging.
The web UI then updates with the job, build status and link to live test version.


Future Work

Allow a staging version of the site to be created from any commit/job.
