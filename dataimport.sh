#!/bin/bash

for entry in ".\demo_datasets\revisions"/*
do
	"C:\Program Files\MongoDB\Server\4.2\bin\mongoimport.exe" --jsonArray --db wikiAnalytics --collection revisions --file "$entry"
done
