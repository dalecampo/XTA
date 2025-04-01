import { track, provider, category, needsClipID } from "./trackingFormulas.js";

let csvData = [];
let csvDataToCopy;
let csvRowsCount;
let prevSegmentName = null;
let prevMusicName = null;
let xml;

// We'll append elements to xmlHierarchyDiv to display the hierarchy on the webpage.
let xmlHierarchyDiv = document.getElementById('xmlHierarchy');
const messageText = document.getElementById("message-text");
messageText.innerHTML = '';

// Sequences with thess prefixes will be treated as segments:
let segmentStartingLetters = [
    "AFV",
    "ATM",
    "ATMFOOD",
    "ATMFood",
    "BULL",
    "Cheeky",
    "CHIVE",
    "CHIVETV",
    "CTV",
    "ESC",
    "ESCAPE",
    "ESCAPETV",
    "FOOD",
    "HAP",
    "HAPPY",
    "HAPPYTV",
    "HappyTV",
    "HTV",
    "NOSTALGIA",
    "NOSTALGIATV",
    "NosTV",
    "PAWS",
    "PAWSTV",
    "RBTV",
    "RED",
    "REDBULL",
    "REDBULLTV",
    "SH",
    "SHTV",
    "Social",
    "SUPER",
    "SUPERHUMAN",
    "SUPERHUMANTV",
    "TATTOO",
    "THROT",
    "THROTTLE",
    "THROTTLETV",
    "ZONE",
    "ZONETV"
];





// File uploads (click or drag/drop uploads)
document.addEventListener('DOMContentLoaded', function () {
    var fileUpload = document.getElementById('xmlFileUpload');
    var dropArea = document.querySelector('.file-upload');
    
    dropArea.addEventListener('dragover', function(event) {
        event.preventDefault();
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', function(event) {
        dropArea.classList.remove('dragover');
    });

    // Handle file upload via drag-and-drop
    dropArea.addEventListener('drop', function(event) {
        event.preventDefault();
        dropArea.classList.remove('dragover');
        // Reset fileUpload input
        fileUpload.value = null;
        fileUpload.files = event.dataTransfer.files;
        handleFileUpload(event);
    });

    // Handle file upload via click
    fileUpload.addEventListener('change', handleFileUpload);
});





// When a file gets uploaded:
function handleFileUpload(event) {
    // Clear previous XML hierarchy
    xmlHierarchyDiv.innerHTML = '';
    csvData = [];
    console.clear();
    messageText.innerHTML = "Processing...";
    event.preventDefault();

    var fileUpload = document.getElementById('xmlFileUpload');
    var uploadLabel = document.getElementById('uploadLabel');
    var dropArea = document.querySelector('.file-upload');

    dropArea.classList.remove('dragover');
    fileUpload.files = event.dataTransfer ? event.dataTransfer.files : fileUpload.files;
    var file = fileUpload.files.item(0);
    if(file) {
        uploadLabel.textContent = file.name;
        dropArea.classList.add('has-file');
        var reader = new FileReader();
        reader.onload = function(e) {
            var xmlString = e.target.result;
            var parser = new DOMParser();
            xml = parser.parseFromString(xmlString, "application/xml");
            displayHierarchy(xml);
            console.log(csvData);
        }
        reader.readAsText(file);
    } else {
        uploadLabel.textContent = 'Add XML File';
        dropArea.classList.remove('has-file');
    }
}





// Event listener for the "How to Get Started" Instructions area:
document.querySelector('.instructions-icon-1').addEventListener('click', function() {
    document.querySelector('.overlay-1').style.display = 'block';
});

document.querySelector('.overlay-1').addEventListener('click', function() {
    document.querySelector('.overlay-1').style.display = 'none';
});

// Event listener for the "How To Use The CSV" Instructions area:
document.querySelector('.instructions-icon-2').addEventListener('click', function() {
    document.querySelector('.overlay-2').style.display = 'block';
});

document.querySelector('.overlay-2').addEventListener('click', function() {
    document.querySelector('.overlay-2').style.display = 'none';
});





// Load the XML file.
function loadXMLFile(file, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var parser = new DOMParser();
            xml = parser.parseFromString(this.responseText, "application/xml");
            callback(xml);
        }
    };
    xhttp.open("GET", file, true);
    xhttp.send();
    messageText.innerHTML = "Processing (Test)...";
}





var showMediaFiles = false; // When set to true, media files become visible on the webpage.

// Get the Show Media Files checkbox element.
var mediaCheckbox = document.getElementById('showMediaFilesCheckbox');

// Handle its change event.
mediaCheckbox.addEventListener('change', function() {
    showMediaFiles = this.checked;
    console.log(`showMediaFiles: ${showMediaFiles}`);
    // Clear the current display.
    document.getElementById("xmlHierarchy").innerHTML = "";
    // Reload and redisplay the XML hierarchy.
    handleFileUpload(event);
});





// Execute when the Convert XML to CSV button gets clicked:
document.getElementById('convert-btn').addEventListener('click', function() {
    // Get the Channel dropdown value
    var channel = document.getElementById('channel-dropdown').value;

    // Get the Date selector value
    var dateDropdown = document.getElementById('date');
    var date = new Date(dateDropdown.value);
    // Format the date in "m/d/yy" format in UTC
    var formattedDate = (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + (date.getUTCFullYear().toString().substr(-2));
    
    // Overwrite the Channel and Date values for all rows based on what the user selected.
    csvData = csvData.map(function(row) {
        row.channel = channel;
        row.date = formattedDate;
        return row;
    });

    // List of clipName values to omit
    var omitClipNames = [
        // Atmosphere House Ads
        "ATM_Content Submit QR.mp4",
        "ATM_Content Submit QR_Music 2.mp4",
        "ATM_HouseAd_2023_V2.mp4",
        "ATM_YouAreWatching.mp4",
        "ATM_YouAreWatching_2.mp4",
        "ATM_YouAreWatching_3.mp4",
        
        // From Justin Lescano
        "Black Video",
        "PhoneFrame.png",
        "Logo_1080_B Viral_Left.png",
        "Graphic",
        "Humor Outro.mp4",
        "Show Me The Funny Intro.mov",
        "Redbull Graffiti.mp4",
        "Daily scroll BG.mp4",
        "Daily Scroll Intro.mov",
        "Chive 2.0 Shape BG.mp4",
        "DDOA TRANSITION.mov",
        "DDOA INTRO.mp4",

        // 1080p Clip Provider Logos
        "Logo_1080_B Viral_Left.png",
        "Logo_1080_B Viral_Right.png",
        "Logo_1080_Caters Clips_Left.png",
        "Logo_1080_Caters Clips_Right.png",
        "Logo_1080_Collab Clips_Left.png",
        "Logo_1080_Collab Clips_Right.png",
        "Logo_1080_FAILARMY_Left.png",
        "Logo_1080_FAILARMY_Right.png",
        "Logo_1080_GoPro_Left.png",
        "Logo_1080_GoPro_Right.png",
        "Logo_1080_Jukin_Left.png",
        "Logo_1080_Jukin_Right.png",
        "Logo_1080_LPE360_Left.png",
        "Logo_1080_LPE360_Right.png",
        "Logo_1080_People Are Awesome V1_Left.png",
        "Logo_1080_People Are Awesome V1_Right.png",
        "Logo_1080_People Are Awesome V2_Left.png",
        "Logo_1080_People Are Awesome V2_Right.png",
        "Logo_1080_Quattro (5sec Fade)_Left.mov",
        "Logo_1080_Quattro_Left.png",
        "Logo_1080_Quattro_Right.png",
        "Logo_1080_The Pet Collective V1_Left.png",
        "Logo_1080_The Pet Collective V1_Right.png",    ,
        "Logo_1080_The Pet Collective V2_Left.png",
        "Logo_1080_The Pet Collective V2_Right.png",
        "Logo_1080_TIH_Left.png",
        "Logo_1080_TIH_Right.png"
    ];

    // Filter out rows in comps with duplicate clips and also rows whose clipName ends with .aep or .aegraphic
    csvData = csvData.filter(function(row, index) {
        // Check if the row has 'compName' and 'clipName' properties and they are strings
        if (row.hasOwnProperty('compName') && typeof row.compName === 'string' &&
            row.hasOwnProperty('clipName') && typeof row.clipName === 'string') {
            // Trim whitespace and remove any surrounding quotes around the compName and clipName
            var compName = row.compName.trim().replace(/^["']|["']$/g, '');
            var clipName = row.clipName.trim().replace(/^["']|["']$/g, '');
    
            // Return false (filter out the row) if the clipName ends with ".aep" or is in the omit list
            if (clipName.endsWith('.aep') || clipName.endsWith('.aegraphic') || omitClipNames.includes(clipName)) {
                return false;
            }
    
            // Check if the compName and clipName are found in any previous rows
            var isDuplicate = false;
            for (var i = 0; i < index; i++) {
                var prevRow = csvData[i];
                if (prevRow.hasOwnProperty('compName') && typeof prevRow.compName === 'string' &&
                    prevRow.hasOwnProperty('clipName') && typeof prevRow.clipName === 'string') {
                    var prevCompName = prevRow.compName.trim().replace(/^["']|["']$/g, '');
                    var prevClipName = prevRow.clipName.trim().replace(/^["']|["']$/g, '');
                    if (prevCompName === compName && prevClipName === clipName) {
                        isDuplicate = true;
                        break;
                    }
                }
            }
    
            // Return true (keep the row) if the compName and clipName are not found in previous rows
            return !isDuplicate;
        }
    
        // If the row doesn't have 'compName' and 'clipName' properties or they aren't strings, keep it in the array
        return true;
    });

    // Get the headers (object keys)
    var headers = "Seg, Comp Name, Clip Name, Clip URL, Music File Name, Channel, Clip ID, Provider, Category, Date\n";
    
    // Convert the array of objects to CSV data
    var data = csvData.map(obj => Object.values(obj).join(',')).join('\n');
    var numberOfRowsInData = (data.match(/\n/g) || []).length;
    console.log(`numberOfRowsInData: ${numberOfRowsInData}`);

    if (numberOfRowsInData > 1) {
        // Combine headers and data
        var csvString = headers + data;
        csvDataToCopy = csvString;

        // Create a Blob with the CSV data
        var blob = new Blob([csvString], {type: 'text/csv;charset=utf-8;'});

        // Use URL.createObjectURL() to create a URL representing the Blob
        var url = URL.createObjectURL(blob);

        var downloadFileName = channel + "_" + formattedDate.replace(/\//g, "-"); + "_Tracking.csv";

        if (channel === "Select Channel") {
            messageText.innerHTML = "Select Channel";
        } else {
            // Create a link and click it to download the CSV file
            var link = document.createElement("a");
            link.href = url;
            link.download = downloadFileName;
            link.click();
            messageText.innerHTML = "Downloaded CSV!";
        }
    } else if (!xml) {
        messageText.innerHTML = "Upload XML";
    } else {
        messageText.innerHTML = "Error: Empty CSV";
    }

    // It's important to revoke the object URL after use to avoid memory leaks
    setTimeout(function() { URL.revokeObjectURL(url); }, 0);
});





// Get reference to the Copy button
var copyButton = document.getElementById("copyButton");

// Add click event listener to the button
copyButton.addEventListener("click", function() {
    // Get the Channel dropdown value
    var channel = document.getElementById('channel-dropdown').value;

    // Get the Date selector value
    var dateDropdown = document.getElementById('date');
    var date = new Date(dateDropdown.value);
    // Format the date in "m/d/yy" format in UTC
    var formattedDate = (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + (date.getUTCFullYear().toString().substr(-2));
    
    // Overwrite the Channel and Date values for all rows based on what the user selected.
    csvData = csvData.map(function(row) {
        row.channel = channel;
        row.date = formattedDate;
        return row;
    });

    // List of clipName values to omit
    var omitClipNames = [
        // House Ads
        "ATM_Content Submit QR.mp4",
        "ATM_Content Submit QR_Music 2.mp4",
        "ATM_HouseAd_2023_V2.mp4",
        "ATM_YouAreWatching.mp4",
        "ATM_YouAreWatching_2.mp4",
        "ATM_YouAreWatching_3.mp4",
        // Bug Boxes
        "ATM Bug (Right).png",
        "ATM Bug (Left).png",
        "ATM BUG_720_Lower Left.png",
        "ATM BUG_720_Lower Right.png",
        "ATM BUG_720_Top Left.png",
        "ATM BUG_720_Top Right.png",
        "ATM BUG_1080_Lower Left.png",
        "ATM BUG_1080_Lower Right.png",
        "ATM BUG_1080_Top Left.png",
        "ATM BUG_1080_Top Right.png",
    ];

    // Filter out rows in comps with duplicate clips and also rows whose clipName ends with .aep or .aegraphic
    csvData = csvData.filter(function(row, index) {
        // Check if the row has 'compName' and 'clipName' properties and they are strings
        if (row.hasOwnProperty('compName') && typeof row.compName === 'string' &&
            row.hasOwnProperty('clipName') && typeof row.clipName === 'string') {
            // Trim whitespace and remove any surrounding quotes around the compName and clipName
            var compName = row.compName.trim().replace(/^["']|["']$/g, '');
            var clipName = row.clipName.trim().replace(/^["']|["']$/g, '');
    
            // Return false (filter out the row) if the clipName ends with ".aep" or is in the omit list
            if (clipName.endsWith('.aep') || clipName.endsWith('.aegraphic') || omitClipNames.includes(clipName)) {
                return false;
            }
    
            // Check if the compName and clipName are found in any previous rows
            var isDuplicate = false;
            for (var i = 0; i < index; i++) {
                var prevRow = csvData[i];
                if (prevRow.hasOwnProperty('compName') && typeof prevRow.compName === 'string' &&
                    prevRow.hasOwnProperty('clipName') && typeof prevRow.clipName === 'string') {
                    var prevCompName = prevRow.compName.trim().replace(/^["']|["']$/g, '');
                    var prevClipName = prevRow.clipName.trim().replace(/^["']|["']$/g, '');
                    if (prevCompName === compName && prevClipName === clipName) {
                        isDuplicate = true;
                        break;
                    }
                }
            }
    
            // Return true (keep the row) if the compName and clipName are not found in previous rows
            return !isDuplicate;
        }
    
        // If the row doesn't have 'compName' and 'clipName' properties or they aren't strings, keep it in the array
        return true;
    });

    // Get the headers (object keys)
    var headers = "Seg\tComp Name\tClip Name\tClip URL\tMusic File Name\tChannel\tClip ID\tProvider\tCategory\tDate\n";
    

    // Convert the array of objects to CSV data
    var data = csvData.map(obj => {
        return Object.values(obj).map(val => {
        // Replace undefined values with an empty string
        if (typeof val === 'undefined') {
            val = '';
        }   
        // Remove the outer set of quotation marks from the value if they exist
        if (typeof val === 'string' && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
            val = val.slice(1, -1);
        }
        // Add double quotes around the value
        return `"${val}"`;
        }).join('\t');
    }).join('\n');

    if (data) {
        // Combine headers and data
        var csvString = headers + data;
        csvDataToCopy = csvString;

        if (channel === "Select Channel") {
            messageText.innerHTML = "Select Channel";
        } else {
            // Create a textarea element and set its value to the CSV data
            var textarea = document.createElement("textarea");
            textarea.value = csvDataToCopy;

            // Append the textarea to the document body
            document.body.appendChild(textarea);

            // Select the text inside the textarea
            textarea.select();

            // Copy the selected text to the clipboard
            document.execCommand("copy");

            // Remove the textarea from the document body
            document.body.removeChild(textarea);

            // Alert the user that the data has been copied
            messageText.innerHTML = "Copied CSV Data!";
        }
    } else if (!xml) {
        messageText.innerHTML = "Upload XML";
    } else {
        messageText.innerHTML = "Error: Empty CSV";
    }
});





// Show the visual hierarchy of the XML both on the webpage and in the browser's console.
function displayHierarchy(xml) {
    // Clear previous XML hierarchy
    xmlHierarchyDiv.innerHTML = '';
    csvData = [];

    // Store the <project> element in projectElement.
    var projectElement = xml.getElementsByTagName('project')[0];
    if (!projectElement) {
        console.error("Error: The XML file does not contain a <project> element.");
        messageText.innerHTML = "XML Missing Project Element";
        return;
    }

    messageText.innerHTML = "Processing...";

    // Start processing from the top-level bins within the project.
    var topLevelBins = projectElement.getElementsByTagName('children')[0]?.children;
    if (topLevelBins) {
        // Convert the NodeList of bins to an array.
        var binArray = Array.from(topLevelBins);
        
        // Filter out any elements that are not bins.
        binArray = binArray.filter(el => el.tagName === 'bin');

        // Sort the array of bins based on their names.
        binArray.sort((a, b) => {
        var nameA = a.getElementsByTagName('name')[0].textContent.toUpperCase(); // ignore upper and lowercase
        var nameB = b.getElementsByTagName('name')[0].textContent.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        // names must be equal
        return 0;
        });

        // Process the bins in the sorted order.
        for (var i = 0; i < binArray.length; i++) {
        processBin(binArray[i], xmlHierarchyDiv);
        }
    }
    
    csvRowsCount = csvData.length;
    //console.log(csvRowsCount);
    messageText.innerHTML = "";
}





// Add each bin to the visual hierarchy.
function processBin(binElement, parentElement) {
    // Get the current bin's name from its nested <name> element.
    var binName = binElement.getElementsByTagName('name')[0].textContent;
    console.log(`\nBin: ${binName}\n`);

    // Create a new <div> element to represent this bin in the HTML output.
    var binDiv = document.createElement('div');
    // Add the 'element' class to this bin.
    binDiv.classList.add('element');

    // Create a <div> for a line break with custom height.
    var lineBreakDiv = document.createElement('div');
    lineBreakDiv.classList.add('custom-line-break');
    // Create a line break element.
    var lineBreak = document.createElement('br');
    // Append the line break to the <div>.
    lineBreakDiv.appendChild(lineBreak);
    // Append the <div> to the bin's div.
    binDiv.appendChild(lineBreakDiv);

    // Create a checkbox input element
    var binCheckbox = document.createElement('input');
    binCheckbox.type = 'checkbox';
    binCheckbox.id = 'checkbox-' + binName;  // Make id unique by appending bin name
    binCheckbox.classList.add('bin-checkbox');  // Add your custom checkbox class
    // Append this checkbox to the bin's <div> element.
    binDiv.appendChild(binCheckbox);

    // Create a label for the checkbox
    var binLabel = document.createElement('label');
    binLabel.for = 'checkbox-' + binName;  // Associate label with checkbox
    binLabel.classList.add('custom-checkbox');  // Add your custom checkbox class

    // Add a 'click' event listener to this custom checkbox.
    binLabel.addEventListener('click', function() {
        // Toggle the .checked class on the custom checkbox.
        this.classList.toggle('checked');

        // Toggle the checked state of the default checkbox.
        binCheckbox.checked = !binCheckbox.checked;

        // Get the parent element that contains both the clicked checkbox and the nested checkboxes.
        var parentElement = this.parentElement;
        // Get all nested checkboxes within this parent element.
        var nestedCheckboxes = parentElement.querySelectorAll('.bin-checkbox, .sequence-checkbox');
        // Change the checked state of each nested checkbox to match the parent.
        for (var i = 0; i < nestedCheckboxes.length; i++) {
            nestedCheckboxes[i].checked = binCheckbox.checked;
            // Also toggle the 'checked' class on their associated labels
            var associatedLabel = document.querySelector(`label[for="${nestedCheckboxes[i].id}"]`);
            if (associatedLabel) {
                if (nestedCheckboxes[i].checked) {
                    associatedLabel.classList.add('checked');
                } else {
                    associatedLabel.classList.remove('checked');
                }
            }
        }
    });

    // Append this label to the bin's <div> element.
    binDiv.appendChild(binLabel);

    // Create a separate <span> element for the bin name.
    var binText = document.createElement('span');
    // Apply the 'bin-font' class to this <span> element so we can style the bin's name differently.
    binText.classList.add('bin-font');
    // Set the text content to match the bin's name.
    binText.textContent = binName;
    // Append this <text> element to the bin's <div> element.
    binDiv.appendChild(binText);

    // Append the bin's <div> element to the parent element.
    parentElement.appendChild(binDiv);

    // Get all direct child <bin> elements from within the current <bin> element.
    var childBinElements = binElement.getElementsByTagName('children')[0]?.children;

    // If there are any child bins, process them.
    if (childBinElements) {
        for (var i = 0; i < childBinElements.length; i++) {
            if (childBinElements[i].tagName === 'bin') {
                processBin(childBinElements[i], binDiv);
            }
        }
    }

    // Get all direct child <sequence> elements from within the current <bin> element.
    var sequenceElements = binElement.getElementsByTagName('children')[0]?.children;

    // Create a Set to keep track of the sequences that have already been displayed.
    var displayedSequences = new Set();

    // Call the function to display the hierarchy of sequences and nested media files.
    if (sequenceElements) {
        displaySequenceHierarchy(sequenceElements, binDiv, 1, displayedSequences);
    }
}





// Find segments that start with a string from segmentStartingLetters and initiate the processing for those in alphabetical order.
function displaySequenceHierarchy(sequenceElements, parentElement, indentLevel, displayedSequences) {
    // Convert NodeList or HTMLCollection to an array
    var sequenceArray = Array.prototype.slice.call(sequenceElements);

    // Filter out sequences that do not start with "ATM"
    var atmSequenceArray = sequenceArray.filter(function(sequenceElement) {
        var sequenceNameElement = sequenceElement.getElementsByTagName('name')[0];
        if (sequenceNameElement) {
            var sequenceName = sequenceNameElement.textContent;
            //console.log(`sequenceName: ${sequenceName}`);

            // Revised version 6/20/24 with a check for new segment starting text:
            var segmentsThatStartWithSegmentLetters = segmentStartingLetters.some(prefix => sequenceName.startsWith(prefix));
            console.log(`segmentsThatStartWithSegmentLetters: ${segmentsThatStartWithSegmentLetters}`);

            return segmentsThatStartWithSegmentLetters;
        }
        return false;
    });

    // Sort the array based on the textContent of the 'name' element
    atmSequenceArray.sort(function(a, b) {
        var nameA = a.getElementsByTagName('name')[0]?.textContent;
        var nameB = b.getElementsByTagName('name')[0]?.textContent;

        if (nameA && nameB) {
            return nameA.localeCompare(nameB);
        } else {
            return 0; // If either nameA or nameB is undefined, consider them equal
        }
    });

    // Process each ATM sequence
    for (var i = 0; i < atmSequenceArray.length; i++) {
        processSequence(atmSequenceArray[i], parentElement, indentLevel, displayedSequences);
    }
}





// Process comps within ATM segments.
function processSequence(sequenceElement, parentElement, indentLevel, displayedSequences) {
    // Get the 'name' element from the current sequence
    var sequenceNameElement = sequenceElement.getElementsByTagName('name')[0];
    // Get the sequence id
    var sequenceId = sequenceElement.getAttribute('id');
    let sequenceName;

    // If the <sequence> element has no nested <name> element, find the element with the same id that does have it.
    if (!sequenceNameElement) {        
        // Find the sequence element with the same id and a nested <name> element.
        var foundElement = xml.querySelector(`sequence[id="${sequenceId}"] name`);
        
        // If the matching element was found:
        if (foundElement) {
            // Save the found element to sequenceElement.
            sequenceElement = foundElement.parentElement;

            // Save the textContent of the name tag to sequenceName
            sequenceName = foundElement.textContent;

            // console.log(`Found ${sequenceId}: ${sequenceName}`);
        } else {
            console.log(`ERROR: SEQUENCE NOT FOUND`);
        }
    } else {
        // Get the sequence name
        sequenceName = sequenceNameElement.textContent;
    }

    console.log(`\n\n\nSEQ: ${sequenceName}`);
    console.log(`SEQ ID: ${sequenceId}`);    

    // If this sequence has not already been displayed...
    if (!displayedSequences.has(sequenceId)) {
        // Add the sequence ID to the Set of displayed sequences
        displayedSequences.add(sequenceId);

        // Create a <div> for a line break with custom height.
        var lineBreakDiv = document.createElement('div');
        lineBreakDiv.classList.add('custom-line-break');
        // Create a line break element.
        var lineBreak = document.createElement('br');
        // Append the line break to the <div>.
        lineBreakDiv.appendChild(lineBreak);
        // Append the <div> to the parent element.
        parentElement.appendChild(lineBreakDiv);

        // Create a <div> for the sequence.
        var sequenceDiv = document.createElement('div');
        // Add the 'element' class and the appropriate indentation level class.
        sequenceDiv.classList.add('element');
        sequenceDiv.classList.add(`indent-level-${indentLevel}`);

        // Create a <span> for the sequence name and apply the 'sequence-font' class.
        var seqText = document.createElement('span');
        seqText.classList.add('sequence-font');

        // Create a checkbox input element
        var sequenceCheckbox = document.createElement('input');
        sequenceCheckbox.type = 'checkbox';
        sequenceCheckbox.id = 'checkbox-' + sequenceName;
        sequenceCheckbox.classList.add('sequence-checkbox');
        // Append this checkbox to the sequence's <div> element.
        sequenceDiv.appendChild(sequenceCheckbox);

        // Create a label for the checkbox
        var sequenceLabel = document.createElement('label');
        sequenceLabel.for = 'checkbox-' + sequenceName;
        sequenceLabel.classList.add('custom-checkbox');

        // Add a 'click' event listener to this custom checkbox.
        sequenceLabel.addEventListener('click', function() {
            // Toggle the .checked class on the custom checkbox.
            this.classList.toggle('checked');
        
            // Toggle the checked state of the default checkbox.
            sequenceCheckbox.checked = !sequenceCheckbox.checked;
        
            // Get the parent div of the sequenceDiv that contains both the clicked checkbox and the nested checkboxes.
            var parentDiv = sequenceDiv;
            // Get all nested checkboxes within this parent div.
            var nestedCheckboxes = parentDiv.querySelectorAll('.bin-checkbox, .sequence-checkbox');
            // Change the checked state of each nested checkbox to match the parent.
            for (var i = 0; i < nestedCheckboxes.length; i++) {
                nestedCheckboxes[i].checked = sequenceCheckbox.checked;
                // Also toggle the 'checked' class on their associated labels
                var associatedLabel = document.querySelector(`label[for="${nestedCheckboxes[i].id}"]`);
                if (associatedLabel) {
                    if (nestedCheckboxes[i].checked) {
                        associatedLabel.classList.add('checked');
                    } else {
                        associatedLabel.classList.remove('checked');
                    }
                }
            }
        });

        // Append this label to the sequence's <div> element.
        sequenceDiv.appendChild(sequenceLabel);

        // If the sequence name starts with an accepted initial text string (from the segmentStartingLetters array), add a specific class
        if (segmentStartingLetters.some(prefix => sequenceName.startsWith(prefix))) {
            seqText.classList.add('atm-sequence');
        }

        // Set the text content to the sequence name.
        seqText.textContent = sequenceName;

        // Append the <span> to the sequence <div>.
        sequenceDiv.appendChild(seqText);
        // Append the sequence <div> to the parent element.
        parentElement.appendChild(sequenceDiv);

        // If the sequence does NOT start with an accepted initial text string (from the segmentStartingLetters array), treat it as a comp instead of a segment (show its media files).
        if (!segmentStartingLetters.some(prefix => sequenceName.startsWith(prefix))) {
            // Store all <media> elements from the current sequence.
            var mediaElements = sequenceElement.getElementsByTagName('media');

            // Create Sets to hold unique video and audio names.
            var videoNamesSet = new Set();
            var audioNamesSet = new Set();

            //console.log(`mediaElements.length: ${mediaElements.length}`);

            // Loop through each media element.
            for (var j = 0; j < mediaElements.length; j++) {
                // Get all 'video' and 'audio' elements within the current media element.
                var videoElements = mediaElements[j].getElementsByTagName('video');
                var audioElements = mediaElements[j].getElementsByTagName('audio');

                if (j === 0) {
                    console.log(`^^^audioElements length: ${audioElements.length}`);
                }

                var musicFile = "";
                let segmentName = null;

                // Extract video file names, log them, and filter out any undefined values.
                [...videoElements].forEach(el => {
                    var fileElements = el.getElementsByTagName('file');
                    
                    // Create the row object's contents for each video file.
                    [...fileElements].forEach(fileEl => {
                        let fileId = fileEl.getAttribute('id');
                        var clipFileName = fileEl.getElementsByTagName('name')[0]?.textContent;

                        // If the <file> element has no nested <name> element, find the element with the same id that does have it.
                        if (!clipFileName) {        

                            // Find the file element with the same id and a nested <name> element.
                            var videoFoundElement = xml.querySelector(`file[id="${fileId}"] name`);
                            
                            // If the matching element was found:
                            if (videoFoundElement) {
                                // Save the textContent of the name tag to fileName
                                clipFileName = videoFoundElement.textContent;
                                //console.log(`Found video with ${fileId}: ${clipFileName}`);
                            } else {
                                console.log(`ERROR: VIDEO <FILE> ELEMENT NOT FOUND`);
                            }
                        }

                        if (clipFileName) { 
                            let compName = sequenceName;
                            // console.log(`compName: ${compName}`);

                            var sequenceCheckbox = parentElement.querySelector('.sequence-checkbox');
                            segmentName = sequenceCheckbox.id.replace('checkbox-', '');
                            // console.log(`SEGMENT NAME: ${segmentName}`);
                            
                            // If the sequence does not start with an approved string from segmentStartingLetters:
                            // Assume that the sequence is a comp, not a segment.
                            if (!segmentStartingLetters.some(prefix => segmentName.startsWith(prefix))) {
                                // Assume it's a nested comp, so segmentName is actually a comp name.
                                compName = segmentName;
                                // console.log(`compName is now: ${compName}`);
                                // Because we assume it's a nested comp, its segment name should match the previous row's segment name.
                                if (prevSegmentName !== null) {
                                    segmentName = prevSegmentName;
                                    // console.log(`segmentName is now: ${segmentName}`);
                                }
                            }

                            // Provider
                            let clipProvider = null;
                            clipProvider = provider(clipFileName);    
                            // Clip ID
                            let clipID = null;
                            clipID = needsClipID(clipProvider);
                            // Category
                            let clipCategory = null;
                            clipCategory = category(clipFileName, clipProvider)
                            // Clip URL
                            const clipURL = track(clipFileName, clipProvider, clipCategory);                                
                            
                            // Create an empty array to store the music file names
                            var uniqueMusicSet = new Set();
                            var uniqueClipAudioSet = new Set();
                            //var hasMusic = false;

                            // Repeat the process for audio file names.
                            [...audioElements].forEach(el => {
                                var audioFileElements = el.getElementsByTagName('file');

                                // Loop through all <file> elements in audioElements. Check if any are music files.
                                [...audioFileElements].forEach(fileEl => {
                                    let audioFileId = fileEl.getAttribute('id');
                                    var audioFoundElement = xml.querySelector(`file[id="${audioFileId}"] name`);
                                    var musicFileName = audioFoundElement.textContent;

                                    if (musicFileName.endsWith(".mp3") || musicFileName.endsWith(".MP3") || musicFileName.endsWith(".wav") || musicFileName.endsWith(".WAV")) {
                                        //hasMusic = true;
                                        audioNamesSet.add(musicFileName);
                                        uniqueMusicSet.add(musicFileName);
                                        musicFile = musicFileName;
                                    } else if (!musicFileName) {
                                        // musicFileName will be false if there is none, so we'll output it as blank.
                                        musicFile = "";
                                    } else {
                                        // Assume that the audio element was from a video's source audio.
                                        uniqueClipAudioSet.add(musicFileName);
                                    }
                                });
                            });
                            
                            if (uniqueClipAudioSet.has(clipFileName)) {
                                musicFile = "Source Video";
                            }
                            
                            // Convert the Set back to an array
                            var listOfMusic = Array.from(uniqueMusicSet);

                            // Set musicFile equal to listOfMusic joined by commas if it is not empty
                            if (listOfMusic.length > 0) {
                                musicFile = listOfMusic.join(", ");
                            }

                            if (!musicFile) {
                                musicFile = prevMusicName;
                            }

                            console.log(`VID: ${clipFileName}`);
                            videoNamesSet.add(clipFileName);

                            var row = {
                                segName: `"${segmentName}"`,
                                compName: `"${compName}"`,
                                clipName: `"${clipFileName}"`,
                                clipURL: `"${clipURL}"`,
                                musicFile: `"${musicFile}"`,
                                channel: "TBD", // Resets when Convert gets clicked
                                clipID: clipID,
                                provider: clipProvider,
                                category: clipCategory,
                                date: "TBD", // Resets when Convert gets clicked
                            };

                            csvData.push(row);
                            //console.log(row);
                        }
                        prevSegmentName = segmentName;
                        // console.log(`prevSegmentName is now set to: ${prevSegmentName}`);
                        prevMusicName = musicFile;
                    });
                });
                console.log(`AUD: ${musicFile}`);
            }

            // For each unique video name, create a new div, add the appropriate classes and text, and append it to the sequence div.
            videoNamesSet.forEach(name => {
                var mediaDiv = document.createElement('div');
                mediaDiv.classList.add('element');
                mediaDiv.classList.add(`indent-level-${indentLevel}`);
                if (!showMediaFiles) {
                    mediaDiv.classList.add('media-file-name');
                }
                mediaDiv.textContent = name;
                sequenceDiv.appendChild(mediaDiv);
            });

            // Repeat the process for each unique audio name.
            audioNamesSet.forEach(name => {
                var mediaDiv = document.createElement('div');
                mediaDiv.classList.add('element');
                mediaDiv.classList.add(`indent-level-${indentLevel}`);
                if (!showMediaFiles) {
                    mediaDiv.classList.add('media-file-name');
                }
                mediaDiv.textContent = name;
                sequenceDiv.appendChild(mediaDiv);
            });
            console.log(``);
        }

        // Get all nested 'sequence' elements from the current sequence.
        var nestedSequenceElements = sequenceElement.getElementsByTagName('sequence');

        // Process each nested sequence
        for (var i = 0; i < nestedSequenceElements.length; i++) {
            processSequence(nestedSequenceElements[i], sequenceDiv, indentLevel + 1, displayedSequences);
        }
    }
}