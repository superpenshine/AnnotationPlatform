- postgres docker start

**docker run -itd --name AlphaApi_db -e POSTGRES_USER=westwell -e POSTGRES_PASSWD=westwell-lab -e POSTGRES_DB=wellocean -p 5432:5432 postgres**

- AlphaApi docker start

**docker run -itd --name AlphaApi_web -p 8083:8080 -v /cv/backup/workspace:/workspace --link AlphaApi_db:db uwsgi /config/uwsgi.ini**