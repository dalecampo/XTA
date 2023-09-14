var totalUsernamesInReport;
var listOfUsernameStatuses;

function runTrackingAudit() {
  // Read the CSV file using fetch
  fetch('ATM Contributors - Contributors.csv')
    .then(response => response.text())
    .then(data => {
        var csvRows = data.split('\n');
        var headers = csvRows[0].split(',');

        var providerIndex = headers.indexOf("Provider");
        var segIndex = headers.indexOf("Seg");
        var compNameIndex = headers.indexOf("Comp Name");
        var clipNameIndex = headers.indexOf("Clip Name");
        var dateIndex = headers.indexOf("Date");

        var dataRows = csvRows.slice(1); // Exclude header row

        // Open ATM Contributors spreadsheet and access necessary sheet
        var atmSpreadsheet = SpreadsheetApp.openById('1_OsXXnVM89nK9FxlursiBl5_oiK26YF_1GRYbi_snCQ');
        var atmSheet = atmSpreadsheet.getSheetByName('Contributors');

        var atmHeaders = atmSheet.getRange(2, 1, 1, atmSheet.getLastColumn()).getValues()[0];
        var statusIndex = atmHeaders.indexOf("Status");
        var companyIndex = atmHeaders.indexOf("Company");
        var firstNameIndex = atmHeaders.indexOf("First Name");
        var lastNameIndex = atmHeaders.indexOf("Last Name");
        var youtubeCreditIndex = atmHeaders.indexOf("YouTube Credit");
        var instagramCreditIndex = atmHeaders.indexOf("Instagram Credit");
        var tiktokCreditIndex = atmHeaders.indexOf("TikTok Credit");

        var atmData = atmSheet.getRange(3, 2, atmSheet.getLastRow() - 2, 7).getValues();

        var approvedNames = [];
        
        // Iterate over each row and check if value in the status column is "Approved", "Approved*", or "Paid"
        for (var i = 0; i < atmData.length; i++) {
        if (atmData[i][statusIndex] == "Approved" || atmData[i][statusIndex] == "Approved*" || atmData[i][statusIndex] == "Paid") {
            // If it is, then add values in relevant columns to approvedNames array
            approvedNames.push(
            atmData[i][companyIndex],
            atmData[i][firstNameIndex],
            atmData[i][lastNameIndex],
            atmData[i][youtubeCreditIndex],
            atmData[i][instagramCreditIndex],
            atmData[i][tiktokCreditIndex]
            );

            // Add combination of First Name and Last Name values with a space character between them
            approvedNames.push(atmData[i][firstNameIndex] + ' ' + atmData[i][lastNameIndex]);
        }
        }

        var reportData = [];
        var unfoundUsernames = [];
        var usernameCount = {};
  
        for (var i = 0; i < data.length; i++) {
            var currentRow = dataRows[i].split(',');
            var currentSegment = currentRow[segIndex];
            var currentDate = currentRow[dateIndex];

        
            var currentSegment = data[i][segIndex - 1];
    
            var currentSegmentInRange = segmentRangeProvided ? (currentSegment >= startSegment && currentSegment <= endSegment) : true;
            
            var currentDate = data[i][dateIndex - 1];
            var startDateObj = startDateProvided ? new Date(startDate) : null;
            var endDateObj = endDateProvided ? new Date(endDate) : null;
        
            var currentDateInRange = (!startDateObj || currentDate >= startDateObj) && (!endDateObj || currentDate <= endDateObj);
        
            if(data[i][providerIndex - 1] == "Contributor Content" && currentDateInRange && currentSegmentInRange) {
                var fileName = data[i][clipNameIndex - 1];
    
                // Extract username from filename using JavaScript's built-in string functions
                var start = fileName.indexOf('(') + 1;
                var end = fileName.indexOf(')_', start);
                var username = fileName.substring(start, end);
        
                // Log the username
                Logger.log('Username: ' + username);
        
                // Check if username is in approvedNames
                var userApproved = approvedNames.flat().includes(username);
                Logger.log('User approved: ' + userApproved);
        
                // Format the date before adding to the reportData array
                var rawDate = data[i][dateIndex - 1];
                var formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "M/d/yy");
        
                if(!userApproved) {
                // If the username is not in the approvedNames list, add it to the reportData array with the formatted date
                reportData.push([data[i][segIndex - 1], data[i][compNameIndex - 1], fileName, formattedDate]);
                if(!unfoundUsernames.includes(username)){
                    unfoundUsernames.push(username);
                }
                usernameCount[username] = (usernameCount[username] || 0) + 1;
            }
        }
        }
    
        var unfoundStatuses = {};
    
        for (var i = 0; i < atmData.length; i++) {
        var usernameInC = atmData[i][1];
        var usernameInD = atmData[i][2];
        var usernameInE = atmData[i][3];
        var usernameInF = atmData[i][4];
        var usernameInG = atmData[i][5];
        var usernameInH = atmData[i][6];
        var usernameInDE = usernameInD + ' ' + usernameInE;
    
        unfoundUsernames.forEach(function(username) {
            if ([usernameInC, usernameInD, usernameInE, usernameInF, usernameInG, usernameInH, usernameInDE].includes(username)) {
            unfoundStatuses[username] = atmData[i][0]; // Save the row's status if a match is found
            }
        });
        }
    
        var reportSheet = ss.getSheetByName("Channel Audit Report");
        if(reportSheet != null){
        reportSheet.clearContents();
    
        var userEmail = Session.getActiveUser().getEmail();
        var channelName = ss.getSheetName();
        var currentDate = Utilities.formatDate(new Date(), "GMT", "M/d/yy");
    
        // After getting data from the active sheet
        var segColumn = data.map(row => row[segIndex - 1]);
        var segStartIndex = segColumn.findIndex(cell => cell === 'Seg');
        var uniqueSegs = new Set();
    
        for (var i = segStartIndex + 1; i < segColumn.length; i++) {
            if (segColumn[i] !== '') { // Check if cell is not empty
            uniqueSegs.add(segColumn[i]);
            }
        }
    
        var uniqueSegsArray = Array.from(uniqueSegs).map(Number).sort((a, b) => a - b);
    
        var segOutput = '';
        var rangeStart = uniqueSegsArray[0];
    
        for (var i = 1; i < uniqueSegsArray.length; i++) {
            if (uniqueSegsArray[i] !== uniqueSegsArray[i - 1] + 1) {
            segOutput += rangeStart === uniqueSegsArray[i - 1] ? `${rangeStart}, ` : `${rangeStart}-${uniqueSegsArray[i - 1]}, `;
            rangeStart = uniqueSegsArray[i];
            }
        }
        segOutput += rangeStart === uniqueSegsArray[uniqueSegsArray.length - 1] ? `${rangeStart}` : `${rangeStart}-${uniqueSegsArray[uniqueSegsArray.length - 1]}`;
            
        var segOutput = [...uniqueSegs].sort((a, b) => a - b).reduce((acc, cur, i, arr) => {
            if (i !== arr.length - 1 && cur + 1 === arr[i + 1]) {
            if (!acc.endsWith('-')) acc += '-';
            } else {
            acc += cur;
            if (i !== arr.length - 1 && acc.endsWith('-')) acc += ', ';
            }
            return acc;
        }, '');
    
        // After getting unfoundUsernames
        var unapprovedUsernamesCount = unfoundUsernames.length;
        totalUsernamesInReport = unapprovedUsernamesCount;
    
        // Format the start and end dates
        var formattedStartDate = Utilities.formatDate(new Date(startDate), "GMT", "M/d/yy");
        var formattedEndDate = Utilities.formatDate(new Date(endDate), "GMT", "M/d/yy");
    
        // Add before writing to the reportSheet
        reportSheet.getRange('A1').setValue('CHANNEL AUDIT REPORT');
        reportSheet.getRange('B2').setValue('Auditor');
        reportSheet.getRange('C2').setValue('Channel');
        reportSheet.getRange('D2').setValue('Date');
        reportSheet.getRange('B3').setValue(userEmail);
        reportSheet.getRange('C3').setValue(channelName + " (" + formattedStartDate + " - " + formattedEndDate + ")");
        reportSheet.getRange('D3').setValue(currentDate);
        reportSheet.getRange('A4').setValue('Total');
        reportSheet.getRange('B4').setValue('Component');
        reportSheet.getRange('C4').setValue('Notes');
        reportSheet.getRange('A5').setFormula('=COUNTA(UNIQUE(INDIRECT(ADDRESS(MATCH("Seg", INDIRECT("A"&(ROW()+1)&":A"), 0) + ROW() + 1, COLUMN())&":A")))');
        reportSheet.getRange('B5').setValue('Segments');
        reportSheet.getRange('C5').setFormula('=ARRAYFORMULA(TEXTJOIN(", ", TRUE, UNIQUE(FILTER(A7:A, ROW(A7:A) > MATCH("Seg", A7:A, 0)+ROW(A7)-1))))');
        reportSheet.getRange('A6').setFormula('=COUNTA(UNIQUE(INDIRECT("C"&(MATCH("Clip Name", C:C, 0)+1)&":C")))');
        reportSheet.getRange('B6').setValue('Clips');
        reportSheet.getRange('A7').setValue(unapprovedUsernamesCount);
        reportSheet.getRange('B7').setValue('Usernames');
        reportSheet.getRange('D8').setValue('Remove');
    
        var usernameData = [];
    
        // Create an object to hold the count for each Contributor Status
        var statusCounts = {};
    
        // Process the username data
        for(var name in usernameCount){
            var status = unfoundStatuses[name] || "Not Found";
            
            // If this status has been encountered before, increment its count;
            // otherwise, set its count to 1
            statusCounts[status] = (statusCounts[status] || 0) + 1;
    
            usernameData.push([usernameCount[name], name, status, ""]);
        }
    
        // Sort usernameData array by Contributor Status, then by username
        usernameData.sort(function(a, b) {
            var statusA = a[2].toUpperCase(); // Ignore case
            var statusB = b[2].toUpperCase(); // Ignore case
            if (statusA < statusB) {
            return -1;
            }
            if (statusA > statusB) {
            return 1;
            }
    
            // If statuses are equal, sort by username
            var usernameA = a[1].toUpperCase(); // Ignore case
            var usernameB = b[1].toUpperCase(); // Ignore case
            if (usernameA < usernameB) {
            return -1;
            }
            if (usernameA > usernameB) {
            return 1;
            }
            
            return 0; // Names and statuses must be equal
        });
    
        reportSheet.getRange(8, 1).setValue("# Times");
        reportSheet.getRange(8, 2).setValue("Usernames");
        reportSheet.getRange(8, 3).setValue("Contributor Status");
    
        // Insert data into the spreadsheet
        for(var i = 0; i < usernameData.length; i++){
            reportSheet.getRange(i + 9, 1).setValue(usernameData[i][0]); // # Times
            reportSheet.getRange(i + 9, 2).setValue(usernameData[i][1]); // Unapproved Usernames
            reportSheet.getRange(i + 9, 3).setValue(usernameData[i][2]); // Contributor Status
            
            reportSheet.getRange(i + 9, 4).setValue(false);
            // Insert checkbox in column D for each unapproved username
            reportSheet.getRange(i + 9, 4).insertCheckboxes();
        }
    
        reportSheet.getRange(usernameData.length + 10, 1, 1, 4).setValues([["Seg", "Comp Name", "Clip Name", "Date"]]);
    
        Logger.log(JSON.stringify(reportData));
    
        reportSheet.getRange(usernameData.length + 11, 1, reportData.length, reportData[0].length).setValues(reportData);
    
        // After filling the report sheet with data, convert the statusCounts object to an array
        var statusCountsArray = Object.keys(statusCounts).map(function(status) {
            return [status, statusCounts[status]];
        });
    
        // Sort the array alphabetically by status
        statusCountsArray.sort(function(a, b) {
            var statusA = a[0].toUpperCase(); // Ignore case
            var statusB = b[0].toUpperCase(); // Ignore case
            if (statusA < statusB) {
            return -1;
            }
            if (statusA > statusB) {
            return 1;
            }
            return 0; // Names must be equal
        });
    
        // Generate the summary string from the sorted array
        var statusSummary = statusCountsArray.map(function(pair) {
            return pair[1] + " " + pair[0];
        }).join(", ");
        listOfUsernameStatuses = statusSummary;
    
        // Set the value of cell C7 to the summary string
        reportSheet.getRange('C7').setValue(statusSummary);
        } else {
        SpreadsheetApp.getUi().alert('Error: "Channel Audit Report" sheet does not exist.');
        }
        // Delete all empty rows at the end of the sheet after generating the report
        var lastRow = reportSheet.getLastRow();
        var maxRows = reportSheet.getMaxRows();
    
        if (maxRows > lastRow) {
        reportSheet.deleteRows(lastRow + 1, maxRows - lastRow);
        }
    })
    .catch(error => {
        console.error('Error fetching CSV file:', error);
    });
  }