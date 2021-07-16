# GSheet-DDNS-Checker

In a Google sheet this script will read column A where the ddns are and read column c, d, e, f, g where the ports are. 
Once Nmap shows if up/down it will show the device that's under a port in a comments and change the colors of the cell. 


# instructions

Get api from https://console.developers.google.com/apis/

Share Email from api in sheet ![image](https://user-images.githubusercontent.com/29134216/109919567-d7a04980-7c86-11eb-81d4-709109d1b388.png)

Download API and put it in root folder

Change index.js API and Sheet ID




Install node.JS https://nodejs.org/en/

# Open Terminal or CMD

npm install Or npm ci

node index.js

# Oprating sytems 

Linux

Windows

# To do

Check prefix in windows for nmap

Video for the dumbis 

Add 2 new col of ports in sheet. At least a explnachion. 

Add note of ISP in col 1,2

If isp is not empty then change color (Avoiding force online from NMap using -Pn)

Evenchally index.js will go into cell instead of notes. (at least index_cell.js index_note.js

ISP - should be strip to ISP Name. on new cell (For my persnal app)


