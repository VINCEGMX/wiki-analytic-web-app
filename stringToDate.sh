#!/bin/bash
echo Please wait till finshed...
mongo --quiet --eval "
	db = db.getSiblingDB('wikiAnalytics');
	db.revisions.find().forEach(function(doc){
		doc.timestamp = new ISODate(doc.timestamp);
		db.revisions.save(doc)
	});
"
echo String to Date conversion Finished

