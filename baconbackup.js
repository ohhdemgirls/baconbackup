var http = require('http') // for comment page requests
  , fs   = require('fs');     // for logging

var baseURL = 'http://www.reddit.com/user/'
  , user    = process.argv[2] // can be replaced with a single username
  , tail    = '/.json?'
  , limit   = 'limit=100'; // set to maximum, to limit page requests; default is 25

var pages = [];     // initialize array of comment pages
var nextPage = '';  // being blank will initially return the first page of comments

var fileName = '.html';

function writeToFile() {
	var date = new Date();
	var comment = '';
	var subreddit = '';
	
	var archive = {}; // initialize object
	
	for(var i = 0; i < pages.length; i++) {
		for(var j = 0; j < pages[i].data.children.length; j++) {
			// write comments to file
			date.setTime(pages[i].data.children[j].data.created_utc * 1000);
			subreddit = pages[i].data.children[j].data.subreddit;
			comment = pages[i].data.children[j].data.body_html;
			if (typeof comment != "undefined") {
				comment = comment.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');  // fix escaped characters <, >, &
			}

			fs.appendFileSync(user + fileName, '<font face="verdana" size="2">'); // deprecated!
			fs.appendFileSync(user + fileName, date + '<BR>' 
							 	+ subreddit + '<BR>'
								+ '\n' + comment + '\n' + '<BR><BR>');
			fs.appendFileSync(user + fileName, '</font>'); // deprecated!
		}
	}
}

function onComplete(DATA, response) {
	DATA = JSON.parse(DATA);
	pages.push(DATA); // add page to array
	nextPage = DATA.data.after;
	console.log('next page: ' + nextPage);
	if(nextPage != null) { // not on the last page
		setTimeout(function(){
			getPage();
		}, 2000);  // 2 second minimum as per Reddit's "be nice and don't hammer our servers" API rule.
	}
	else {
		console.log('==> finished; page count: ' + pages.length);
		writeToFile();
		console.log('==> done writing to file');
	}
}

function getPage() { 
	var URL = baseURL + user + tail + limit + '&after=' + nextPage;
	var data = '';
	
	http.get(URL, function(response) {
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			onComplete(data);
		});
		
	}).on('error', function(e) {
		console.log("Error: " + e.message);
	});
}

getPage();  // kick it off!