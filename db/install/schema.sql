CREATE TABLE IF NOT EXISTS users (
	username TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	surname TEXT NOT NULL,
    biografy TEXT,
    imageprofile TEXT,
	password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS advertiser (
    advertiserid TEXT PRIMARY KEY,
    FOREIGN KEY (advertiserid) REFERENCES users (username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reader (
    readerid TEXT NOT NULL,
    FOREIGN KEY (readerid) REFERENCES users (username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS category (
    name TEXT PRIMARY KEY,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
    articlesid INTEGER PRIMARY KEY AUTOINCREMENT,
    advertiserid TEXT NOT NULL,
    categoryid TEXT NOT NULL, 
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    markdown TEXT NOT NULL,
    imagearticle TEXT,
    UNIQUE(title, advertiserid),
    FOREIGN KEY (advertiserid) REFERENCES advertiser (advertiserid) ON DELETE CASCADE,
    FOREIGN KEY (categoryid) REFERENCES category (name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS material (
    materialid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    articlesid INTEGER NOT NULL,
    filepath TEXT NOT NULL,
    virustotalurl TEXT,
    UNIQUE(articlesid, filepath),
    FOREIGN KEY (articlesid) REFERENCES articles (articlesid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    username TEXT,
    articlesid INTEGER,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    stars INTEGER NOT NULL CHECK (stars > 0 AND stars < 6) ,
    PRIMARY KEY (username, articlesid)
    FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE, 
    FOREIGN KEY (articlesid) REFERENCES articles (articlesid) ON DELETE CASCADE
);