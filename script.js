import { track, provider, category, needsClipID } from "./trackingFormulas.js";

let csvData = [];
let csvDataToCopy;
let prevSegmentName = null;
let prevMusicName = null;
let xml;
let showMediaFiles = false; // When set to true, media files become visible on the webpage.

let adminMode = false;
let airtableBases = [];
let hasSuccessfullyUploaded = false; // NEW: Tracks if a successful upload has occurred this session

// We'll append elements to xmlHierarchyDiv to display the hierarchy on the webpage.
let xmlHierarchyDiv = document.getElementById('xmlHierarchy');
let messageText = document.getElementById("message-text");
messageText.innerHTML = '';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

let googleClientId;
const herokuApiBaseUrl = 'https://atmosphere-xta-f0c50c5d2111.herokuapp.com'; // Heroku app URL

///////////////////////////
////// GOOGLE LOGIN ///////
///////////////////////////

function initGoogleIdentityServices() {
    if (!googleClientId) {
        console.error("🔴 Google Client ID is not available. Cannot initialize Google Identity Services.");
        return;
    }
    if (adminMode) {
        console.log("🚀 Initializing Google Identity Services with Client ID:", googleClientId);
    }
    try {
        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleSignInResponse, // This function executes after successful Google login
            auto_select: true
        });
        google.accounts.id.renderButton(
            document.getElementById("googleSignInButton"),
            { theme: "outline", size: "large" }
        );
        google.accounts.id.prompt();

        if (adminMode) {
            console.log("✅ Google Sign-In services initialized and button rendered.");
        }
    } catch (error) {
        console.error("🔴 Error initializing Google Identity Services:", error);
    }
}

// Callback function after Google Sign-In
function handleGoogleSignInResponse(response) {
    updateUIAfterSignInVisuals();
}

function updateUIAfterSignInVisuals() {
    const signInButton = document.getElementById('googleSignInButton');
    const mainContent = document.getElementById('main-content');
    
    signInButton.style.display = 'none';

    setTimeout(() => {
        mainContent.style.opacity = 1;
        mainContent.style.visibility = 'visible';
        mainContent.style.display = 'block';
    }, 250)
}

/////////////////////////////////
////// APP CONFIG & INIT ////////
/////////////////////////////////

async function fetchConfigAndInitializeApp() {
    if (adminMode) {
        console.log('🚀 Attempting to fetch app config from Heroku...');
    }

    try {
        const response = await fetch(`${herokuApiBaseUrl}/api/app-config`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch app config: ${response.status} - ${errorText}`);
        }

        const clientConfig = await response.json();
        if (adminMode) {
            console.log('✅ App Config Received from Heroku:', clientConfig);
        }

        // Access the specific values and use them
        if (clientConfig.googleClientId) { // Ensure this matches the key sent by your backend
            googleClientId = clientConfig.googleClientId;
            initGoogleIdentityServices(); // Initialize Google Sign-In
        } else {
            console.error('🔴 GOOGLE_CLIENT_ID not found in the response from /api/app-config. Expected format: {"googleClientId": "your-id"}');
        }

        if (clientConfig.airtableBases && Array.isArray(clientConfig.airtableBases)) {
            airtableBases = clientConfig.airtableBases; // Store the list of {name, id} objects

            if (adminMode) console.log('🔑 Airtable Bases (name/id pairs) loaded from backend:', airtableBases);

            setupChannelDropdownListener(); // Update channel dropdown listener now that we have the bases
        } else {
            console.warn('⚠️ Airtable Bases not found or not in correct format in config.');
        }

    } catch (error) {
        console.error('🔴 Error fetching app configuration:', error);
    }
}

window.onload = fetchConfigAndInitializeApp;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////
/////// REFERENCE ////////
//////////////////////////

// Sequences with thess prefixes will be treated as segments:
let segmentStartingLetters = [
    "AFV",
    "ALP",
    "ATM",
    "ATMFOOD",
    "ATMFood",
    "BBUM",
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

// List of clipName values to omit
let omitClipNames = [
    // Tanner's list
    "Chive-TV-Transition02.mov",
    "# Chive Transition 1.mov",
    "# Chive Transition 2.mov",
    "Chive Transition _The Hoard_V1.mov",
    "Chive-TV-Transition01.mov",
    "Chive Transition_The Board_V1.mov",
    "ATM-Logo-BUG-v2-RIGHT.png",
    "C0tW_BUG.png",
    "ChiveTV-COTW-JF-16x9/ChiveTV-COTW-JF-16x9.aegraphic",
    "DDoA - INTRO + BG.mp4",
    "ChiveTV Logo L3_FULL.png",
    
    // Daniel's list
    "AE Attribution Bottom Right Square/AE Attribution Bottom Right Square.aegraphic",
    "Graphic",
    "Chive_1080_Attribution/Chive_1080_Attribution.aegraphic",
    "SH_VERTICAL_JL_V01 to V04.mov",
    "Happy Border 1.png",
    "Chive 2.0 Triangle BG overlay.mp4",
    "Grid BG.mp4",
    "Chive 2.0 Shape BG.mp4",
    "Chive 2.0 Line BG.mp4",
    "ChiveTV_LocationPin.aegraphic",

    // Collin's Chive media
    "CartoonCityStreet_Transition-003.mov",
    "CitySwoop_Transition-002.mov",
    "CTV Travels Intro.mp4",
    "CTV_AdventureTransition.mov",
    "CTV_ClothWipeTransition.mov",
    "CTV_CSlide_DarkTransition.mov",
    "CTV_CSlide_LightTransition.mov",
    "CTV_DinoTransition.mov",
    "CTV_LettersTransition.mov",
    "CTV_PlasticWipeTransition.mov",
    "CTV_QueenBeeTransition.mov",
    "CTV_TrickShotTransition.mov",
    "DDOA TRANSITION.mov",
    "Glitch Trans.mov",
    "SchoolOfHardKnocks_Transition.mov",
    "Chive Transition _The Hoard_V1.mov",
    "Chive Transition_The Board_V1.mov",
    "Chive-TV-Transition01.mov",
    "Chive-TV-Transition02.mov",
    "CTV_FlamingosTrans.mov",
    "CTV_DockTrans.mov",
    "# Chive Transition 1.mov",
    "# Chive Transition 2.mov",
    
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
    "Logo_1080_The Pet Collective V1_Right.png",
    "Logo_1080_The Pet Collective V2_Left.png",
    "Logo_1080_The Pet Collective V2_Right.png",
    "Logo_1080_TIH_Left.png",
    "Logo_1080_TIH_Right.png"
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////
////// FILE UPLOAD ///////
//////////////////////////

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
            if (adminMode) {
                console.log(csvData);    
            }
        }
        reader.readAsText(file);
    } else {
        uploadLabel.textContent = 'Add XML File';
        dropArea.classList.remove('has-file');
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////
/// POPUP INSTRUCTIONS ///
//////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////
/////// SHOW MEDIA ///////
//////////////////////////

var mediaCheckbox = document.getElementById('showMediaFilesCheckbox');

// Handle its change event.
mediaCheckbox.addEventListener('change', function() {
    showMediaFiles = this.checked;
    document.getElementById("xmlHierarchy").innerHTML = ""; // Clear the current display.
    handleFileUpload(event); // Reload and redisplay the XML hierarchy.
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////
////// DOWNLOAD CSV //////
//////////////////////////

// Execute when the Convert XML to CSV button gets clicked:
document.getElementById('download-csv-btn').addEventListener('click', function() {
    var channel = document.getElementById('channel-dropdown').value; // Get the Channel dropdown value
    var dateDropdown = document.getElementById('date'); // Get the Date selector value
    var date = new Date(dateDropdown.value);
    var formattedDate = (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + (date.getUTCFullYear().toString().substr(-2)); // Format the date in "m/d/yy" format in UTC
    
    // Overwrite the Channel and Date values for all rows based on what the user selected.
    csvData = csvData.map(function(row) {
        row.channel = channel;
        row.date = formattedDate;
        return row;
    });

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
    if (adminMode) {
        console.log(`numberOfRowsInData: ${numberOfRowsInData}`);
    }

    if (numberOfRowsInData > 1) {
        var csvString = headers + data; // Combine headers and data
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////
/////// COPY CELLS ///////
//////////////////////////

document.getElementById("copy-cells-btn").addEventListener("click", function() {
    var channel = document.getElementById('channel-dropdown').value; // Get the Channel dropdown value
    var dateDropdown = document.getElementById('date'); // Get the Date selector value
    var date = new Date(dateDropdown.value);
    var formattedDate = (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + (date.getUTCFullYear().toString().substr(-2)); // Format the date in "m/d/yy" format in UTC
    
    // Overwrite the Channel and Date values for all rows based on what the user selected.
    csvData = csvData.map(function(row) {
        row.channel = channel;
        row.date = formattedDate;
        return row;
    });

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
        var csvString = headers + data; // Combine headers and data
        csvDataToCopy = csvString;

        if (channel === "Select Channel") {
            messageText.innerHTML = "Select Channel";
        } else {
            // Create a textarea element and set its value to the CSV data
            var textarea = document.createElement("textarea");
            textarea.value = csvDataToCopy;

            // Append the textarea to the document body
            document.body.appendChild(textarea);

            textarea.select(); // Select the text inside the textarea
            document.execCommand("copy"); // Copy the selected text to the clipboard
            document.body.removeChild(textarea); // Remove the textarea from the document body
            messageText.innerHTML = "Copied CSV Data!"; // Alert the user that the data has been copied
        }
    } else if (!xml) {
        messageText.innerHTML = "Upload XML";
    } else {
        messageText.innerHTML = "Error: Empty CSV";
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////
/// DISPLAY HIERARCHY ////
//////////////////////////

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
    messageText.innerHTML = "";
}

//////////////////////////
////////// BINS //////////
//////////////////////////

function processBin(binElement, parentElement) {
    // Get the current bin's name from its nested <name> element.
    var binName = binElement.getElementsByTagName('name')[0].textContent;
    if (adminMode) {
        console.log(`\nBin: ${binName}\n`);
    }

    // Create a new <div> element to represent this bin in the HTML output.
    var binDiv = document.createElement('div');
    binDiv.classList.add('element'); // Add the 'element' class to this bin.

    // Create a <div> for a line break with custom height.
    var lineBreakDiv = document.createElement('div');
    lineBreakDiv.classList.add('custom-line-break');
    var lineBreak = document.createElement('br'); // Create a line break element.
    lineBreakDiv.appendChild(lineBreak); // Append the line break to the <div>.
    binDiv.appendChild(lineBreakDiv); // Append the <div> to the bin's div.

    // Create a checkbox input element
    var binCheckbox = document.createElement('input');
    binCheckbox.type = 'checkbox';
    binCheckbox.id = 'checkbox-' + binName;  // Make id unique by appending bin name
    binCheckbox.classList.add('bin-checkbox');  // Add your custom checkbox class
    binDiv.appendChild(binCheckbox); // Append this checkbox to the bin's <div> element.

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

//////////////////////////
/////// SEQUENCES ////////
//////////////////////////

// Find segments that start with a string from segmentStartingLetters and initiate the processing for those in alphabetical order.
function displaySequenceHierarchy(sequenceElements, parentElement, indentLevel, displayedSequences) {
    // Convert NodeList or HTMLCollection to an array
    var sequenceArray = Array.prototype.slice.call(sequenceElements);

    // Filter out sequences that do not start with "ATM"
    var atmSequenceArray = sequenceArray.filter(function(sequenceElement) {
        var sequenceNameElement = sequenceElement.getElementsByTagName('name')[0];
        if (sequenceNameElement) {
            var sequenceName = sequenceNameElement.textContent;

            // Revised version 6/20/24 with a check for new segment starting text:
            var segmentsThatStartWithSegmentLetters = segmentStartingLetters.some(prefix => sequenceName.startsWith(prefix));

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
    var sequenceId = sequenceElement.getAttribute('id'); // Get the sequence id
    let sequenceName;

    // If the <sequence> element has no nested <name> element, find the element with the same id that does have it.
    if (!sequenceNameElement) {        
        // Find the sequence element with the same id and a nested <name> element.
        var foundElement = xml.querySelector(`sequence[id="${sequenceId}"] name`);
        
        // If the matching element was found:
        if (foundElement) {
            sequenceElement = foundElement.parentElement; // Save the found element to sequenceElement.
            sequenceName = foundElement.textContent; // Save the textContent of the name tag to sequenceName
        } else {
            if (adminMode) {
                console.log(`ERROR: SEQUENCE NOT FOUND`);
            }
        }
    } else {
        // Get the sequence name
        sequenceName = sequenceNameElement.textContent;
    }

    if (adminMode) {
        console.log(`\n\n\nSEQ: ${sequenceName}`);
        console.log(`SEQ ID: ${sequenceId}`);    
    }

    // If this sequence has not already been displayed...
    if (!displayedSequences.has(sequenceId)) {
        // Add the sequence ID to the Set of displayed sequences
        displayedSequences.add(sequenceId);

        // Create a <div> for a line break with custom height.
        var lineBreakDiv = document.createElement('div');
        lineBreakDiv.classList.add('custom-line-break');
        var lineBreak = document.createElement('br'); // Create a line break element.
        lineBreakDiv.appendChild(lineBreak); // Append the line break to the <div>.
        parentElement.appendChild(lineBreakDiv); // Append the <div> to the parent element.

        var sequenceDiv = document.createElement('div'); // Create a <div> for the sequence.
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
        sequenceDiv.appendChild(sequenceCheckbox); // Append this checkbox to the sequence's <div> element.

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

        sequenceDiv.appendChild(seqText); // Append the <span> to the sequence <div>.
        parentElement.appendChild(sequenceDiv); // Append the sequence <div> to the parent element.

        // If the sequence does NOT start with an accepted initial text string (from the segmentStartingLetters array), treat it as a comp instead of a segment (show its media files).
        if (!segmentStartingLetters.some(prefix => sequenceName.startsWith(prefix))) {
            // Store all <media> elements from the current sequence.
            var mediaElements = sequenceElement.getElementsByTagName('media');

            // Create Sets to hold unique video and audio names.
            var videoNamesSet = new Set();
            var audioNamesSet = new Set();

            // Loop through each media element.
            for (var j = 0; j < mediaElements.length; j++) {
                // Get all 'video' and 'audio' elements within the current media element.
                var videoElements = mediaElements[j].getElementsByTagName('video');
                var audioElements = mediaElements[j].getElementsByTagName('audio');

                if (j === 0 && adminMode) {
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
                            
                            if (videoFoundElement) { // If the matching element was found:
                                clipFileName = videoFoundElement.textContent; // Save the textContent of the name tag to fileName
                            } else if (adminMode) {
                                console.log(`ERROR: VIDEO <FILE> ELEMENT NOT FOUND`);
                            }
                        }

                        if (clipFileName) { 
                            let compName = sequenceName;
                            let sequenceCheckbox = parentElement.querySelector('.sequence-checkbox');
                            segmentName = sequenceCheckbox.id.replace('checkbox-', '');
                            
                            // If the sequence does not start with an approved string from segmentStartingLetters:
                            // Assume that the sequence is a comp, not a segment.
                            if (!segmentStartingLetters.some(prefix => segmentName.startsWith(prefix))) {
                                // Assume it's a nested comp, so segmentName is actually a comp name.
                                compName = segmentName;
                                // Because we assume it's a nested comp, its segment name should match the previous row's segment name.
                                if (prevSegmentName !== null) {
                                    segmentName = prevSegmentName;
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
                            let uniqueMusicSet = new Set();
                            let uniqueClipAudioSet = new Set();

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
                                        musicFile = ""; // musicFileName will be false if there is none, so we'll output it as blank.
                                    } else {
                                        uniqueClipAudioSet.add(musicFileName); // Assume that the audio element was from a video's source audio.
                                    }
                                });
                            });
                            
                            if (uniqueClipAudioSet.has(clipFileName)) {
                                musicFile = "Source Video";
                            }
                            
                            // Convert the Set back to an array
                            var listOfMusic = Array.from(uniqueMusicSet);

                            // Set musicFile equal to listOfMusic joined by commas if it is not empty.
                            if (listOfMusic.length > 0) {
                                musicFile = listOfMusic.join(", ");
                            }

                            if (!musicFile) {
                                musicFile = prevMusicName;
                            }

                            if (adminMode) {
                                console.log(`VID: ${clipFileName}`);
                            }

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
                        }
                        prevSegmentName = segmentName;
                        prevMusicName = musicFile;
                    });
                });
                if (adminMode) {
                    console.log(`AUD: ${musicFile}`);
                }
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

            if (adminMode) {
                console.log(``);
            }
        }

        // Get all nested 'sequence' elements from the current sequence.
        var nestedSequenceElements = sequenceElement.getElementsByTagName('sequence');

        // Process each nested sequence
        for (var i = 0; i < nestedSequenceElements.length; i++) {
            processSequence(nestedSequenceElements[i], sequenceDiv, indentLevel + 1, displayedSequences);
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////
//////// AIRTABLE ////////
//////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('channel-dropdown');
    const uploadButton = document.getElementById('upload-airtable-btn');

    dropdown.addEventListener('change', () => {
        const selectedValue = dropdown.value;
        const isValidChannel = airtableBases.some(base => base.name === selectedValue);

        uploadButton.disabled = !isValidChannel;
        uploadButton.classList.toggle('inactive-btn', !isValidChannel);
    });
});

// Original fieldMapping (used by convertCSVtoAirtableRecords)
const fieldMapping = {
    'segName': 'XTA_Segment Name',
    'compName': 'XTA_Comp Name',
    'clipName': 'Clip File Name',
    'clipURL': 'Clip URL',
    'musicFile': 'Music File Name',
    'channel': 'Channel',
    'clipID': 'Clip ID',
    'provider': 'Provider',
    'category': 'Category',
    'date': 'Posted Date'
};

async function uploadToAirtable(baseId, records, apiKey) {
    const tableName = 'Clips';
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

    const chunks = chunkArray(records, 10); // Airtable API max is 10 records per request

    for (const chunk of chunks) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records: chunk })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Error uploading to Airtable:', data);
            throw new Error(`Airtable upload failed: ${data.error?.message}`);
        }
    }

    messageText.innerHTML = 'Uploaded to Airtable!';
}

function chunkArray(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

// Remove any extra quotation marks and trim
function cleanValue(value) {
    if (typeof value === 'string') {
        let cleanedValue = value.trim();
        if (cleanedValue.startsWith('"') && cleanedValue.endsWith('"')) {
            cleanedValue = cleanedValue.substring(1, cleanedValue.length - 1);
        }
        return cleanedValue.trim(); // Trim again in case of spaces inside quotes
    }
    return value; // Return as is if it was not a string
}

function convertCSVtoAirtableRecords(processedRecordsArray) {
    return processedRecordsArray.map(processedRow => {
        return { fields: processedRow };
    });
}

// Button click for Upload to Airtable
document.getElementById('upload-airtable-btn').addEventListener('click', async () => {
    const uploadButton = document.getElementById('upload-airtable-btn');
    // Assuming 'messageText' is an existing HTML element for displaying messages
    const messageText = document.getElementById('message-text'); 

    // If already successfully uploaded, inform the user and do nothing else.
    if (hasSuccessfullyUploaded) {
        if(adminMode) console.log("Upload button clicked, but an upload already succeeded this session. No action taken.");
        messageText.innerHTML = "You have already successfully uploaded data in this session! Refresh the page to upload a new XML.";
        return;
    }
    
    const channelDropdown = document.getElementById('channel-dropdown');
    const dateDropdown = document.getElementById('date');

    // Validate presence of dropdown elements
    if (!channelDropdown || !dateDropdown) {
        messageText.innerHTML = 'Error: Channel or Date dropdown element is missing from the page.';
        console.error('Channel or Date dropdown element is missing from the page.');
        return;
    }

    const selectedChannelName = channelDropdown.value;
    const dateValue = dateDropdown.value;
    const tableName = 'Clips'; // Define your target table name

    // Validate user selections
    if (selectedChannelName === "Select Channel" || !selectedChannelName) {
        messageText.innerHTML = 'Please select a Channel first.';
        return;
    }
    if (!dateValue) {
        messageText.innerHTML = 'Please select a Date first.';
        return;
    }
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
        messageText.innerHTML = 'CSV data is missing, not in the correct array format, or empty. Please upload XML.';
        console.error('csvData is invalid or empty:', csvData);
        return;
    }

    // Find the baseId corresponding to the selectedChannelName from the backend-provided list (assuming airtableBases is defined globally)
    const selectedBase = airtableBases.find(base => base.name === selectedChannelName);

    // Validate Airtable base configuration
    if (!selectedBase || !selectedBase.id) {
        messageText.innerHTML = `Error: The selected channel "${selectedChannelName}" is not configured for Airtable uploads or has no valid Base ID. Please check backend configuration or select a different channel.`;
        // Disable the button if configuration is invalid
        uploadButton.disabled = true;
        uploadButton.classList.add('inactive-btn');
        return;
    }
    const baseId = selectedBase.id; // Use the ID from the matched base

    if (adminMode) {
        console.log(`Selected Channel: ${selectedChannelName}, Mapped Base ID: ${baseId}`);
    }

    // Format the date for Airtable field (e.g., "MM/DD/YY")
    const dateObj = new Date(dateValue + 'T00:00:00Z');
    let formattedMonth = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    let formattedDay = dateObj.getUTCDate().toString().padStart(2, '0');
    let year = dateObj.getUTCFullYear().toString().slice(-2);
    const formattedDateForAirtableField = `${formattedMonth}/${formattedDay}/${year}`;

    // Create a deep copy of csvData to work with, preserving the original csvData
    // This is crucial if csvData might be modified by other functions (like CSV download)
    // or if the user expects the original state to be maintained after an upload attempt.
    let dataForUpload = JSON.parse(JSON.stringify(csvData));

    // Overwrite the Channel and Date values for all rows in the upload batch
    // based on what the user selected. This prepares the data for filtering.
    dataForUpload = dataForUpload.map(function(row) {
        row.channel = selectedChannelName;
        row.date = formattedDateForAirtableField;
        return row;
    });

    // ************************************************
    // Start of Duplicate Removal and Filtering Logic
    // ************************************************

    // Store initial count for logging purposes (if adminMode is true)
    const initialRecordCount = dataForUpload.length;

    // Filter out rows with duplicate clips based on 'compName' and 'clipName',
    // and also remove rows whose 'clipName' ends with ".aep", ".aegraphic",
    // or is present in the 'omitClipNames' list.
    // 'omitClipNames' is assumed to be an array defined in an accessible scope.
    dataForUpload = dataForUpload.filter(function(row, index, self) { // 'self' refers to the array being filtered (dataForUpload)
        // Ensure the row has the necessary properties and they are strings
        if (row.hasOwnProperty('compName') && typeof row.compName === 'string' &&
            row.hasOwnProperty('clipName') && typeof row.clipName === 'string') {
            
            // Trim whitespace and remove any surrounding quotes from compName and clipName
            const compName = row.compName.trim().replace(/^["']|["']$/g, '');
            const clipName = row.clipName.trim().replace(/^["']|["']$/g, '');
    
            // Filter out if clipName ends with specific extensions or is in the omit list
            // Added a check for 'omitClipNames' existence to prevent errors if it's undefined
            if (clipName.endsWith('.aep') || clipName.endsWith('.aegraphic') || (typeof omitClipNames !== 'undefined' && omitClipNames.includes(clipName))) {
                return false; // Exclude this row
            }
    
            // Check for duplicates within the current batch of dataForUpload
            // We iterate through previously processed rows (up to the current index)
            let isDuplicate = false;
            for (let i = 0; i < index; i++) {
                const prevRow = self[i]; // Compare against original items in the current filtering batch
                if (prevRow.hasOwnProperty('compName') && typeof prevRow.compName === 'string' &&
                    prevRow.hasOwnProperty('clipName') && typeof prevRow.clipName === 'string') {
                    const prevCompName = prevRow.compName.trim().replace(/^["']|["']$/g, '');
                    const prevClipName = prevRow.clipName.trim().replace(/^["']|["']$/g, '');
                    
                    // If both compName and clipName match a previous row, it's a duplicate
                    if (prevCompName === compName && prevClipName === clipName) {
                        isDuplicate = true;
                        break; // No need to check further
                    }
                }
            }
            return !isDuplicate; // Keep the row if it's not a duplicate
        }

        // If the row does not have 'compName'/'clipName' or they are not strings, keep it by default
        return true;
    });

    if (adminMode) {
        console.log(`Initial records for upload: ${initialRecordCount}, Records after filtering: ${dataForUpload.length}`);
    }

    // If no data remains after filtering, inform the user and stop the upload process.
    if (dataForUpload.length === 0) {
        messageText.innerHTML = "No valid records to upload after filtering for duplicates and omitted clip names.";
        uploadButton.disabled = false; // Re-enable the button as no upload happened
        return;
    }

    // ************************************************
    // End of Duplicate Removal and Filtering Logic
    // ************************************************

    // Map the filtered and formatted data to the structure required for Airtable fields
    // Assuming 'fieldMapping' and 'cleanValue' are defined globally or in an accessible scope.
    const processedFieldData = dataForUpload.map(csvRow => {
        const recordFields = {};
        for (const [csvKey, targetKey] of Object.entries(fieldMapping)) {
            if (csvRow.hasOwnProperty(csvKey)) {
                const cleaned = cleanValue(csvRow[csvKey]);
                // Only include field if it has a cleaned value, unless it's Channel or Posted Date
                if (cleaned !== undefined && cleaned !== null && cleaned !== '') {
                    recordFields[targetKey] = cleaned;
                } else if (targetKey === 'Channel' || targetKey === 'Posted Date') {
                    // Crucial fields like Channel and Posted Date should always be included, even if empty
                    recordFields[targetKey] = csvRow[csvKey];
                }
            }
        }
        return recordFields;
    });

    // Convert the processed field data into the Airtable records payload format
    const airtableRecordsPayload = convertCSVtoAirtableRecords(processedFieldData);

    // Add "Processing Status" to the last record for backend tracking
    if (airtableRecordsPayload.length > 0) {
        const lastRecordIndex = airtableRecordsPayload.length - 1;
        // Ensure the 'fields' object exists before adding a property
        if (!airtableRecordsPayload[lastRecordIndex].fields) {
            airtableRecordsPayload[lastRecordIndex].fields = {};
        }
        airtableRecordsPayload[lastRecordIndex].fields["Processing Status"] = "Processing";
        if (adminMode) {
            console.log("📝 Added 'Processing Status: Processing' to the last record:\n", airtableRecordsPayload[lastRecordIndex]);
        }
    }

    if (adminMode) {
        console.log('Final records being sent to backend:', JSON.stringify(airtableRecordsPayload, null, 2));
    }

    // Display upload status and disable the button during the upload process
    messageText.innerHTML = 'Uploading...';
    uploadButton.disabled = true;

    try {
        // Send the records to your backend API for Airtable upload
        const response = await fetch(`${herokuApiBaseUrl}/api/upload-to-airtable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                baseId: baseId, // Dynamically determined baseId
                tableName: tableName,
                records: airtableRecordsPayload
            })
        });
        const result = await response.json();

        // Check if the upload was successful based on response status and custom success flag
        if (!response.ok || !result.success) {
            console.error('Error uploading to Airtable via backend:', result);
            throw new Error(result.error || `Airtable upload failed with status: ${response.status}`);
        }
        
        // Update message and set success flag
        messageText.innerHTML = result.message || 'Uploaded to Airtable successfully!';
        if (adminMode) {
            console.log('Upload successful:', result);
        }
        hasSuccessfullyUploaded = true; // Set flag on successful upload
        // Button remains disabled if upload was successful (handled in finally block)
    } catch (err) {
        // Handle upload errors
        console.error('Upload failed:', err);
        messageText.innerHTML = `Upload failed: ${err.message}. Please check the console for more details.`;
    } finally {
        // Logic to re-enable or keep button disabled based on upload success and channel validity
        if (!hasSuccessfullyUploaded) {
            // Re-enable only if upload failed AND current channel selection is valid
            const currentSelectedChannelName = document.getElementById('channel-dropdown').value;
            const currentCorrespondingBase = airtableBases.find(base => base.name === currentSelectedChannelName);
            const isChannelCurrentlyValid = currentSelectedChannelName !== 'Select Channel' && currentSelectedChannelName !== '' && currentCorrespondingBase;
            
            if (isChannelCurrentlyValid) {
                uploadButton.disabled = false;
            } else {
                // Keep disabled if channel became invalid during the attempt
                uploadButton.disabled = true;
            }
        } else {
             // Explicitly ensure it's disabled if successful, as new XML requires refresh
            uploadButton.disabled = true;
        }
    }
});

function setupChannelDropdownListener() {
    const dropdown = document.getElementById('channel-dropdown');
    const uploadButton = document.getElementById('upload-airtable-btn');

    dropdown.addEventListener('change', () => {
        // If an upload has already succeeded this session, keep the button disabled.
        if (hasSuccessfullyUploaded) {
            uploadButton.disabled = true;
            uploadButton.classList.add('inactive-btn');
            if(adminMode) console.log("Channel changed, but upload already succeeded. Button remains disabled.");
            return;
        }
        const selectedChannelName = dropdown.value;
        // Check if the selected channel name has a corresponding base in our backend-provided list
        const correspondingBase = airtableBases.find(base => base.name === selectedChannelName);
        
        const isValidAndConfiguredChannel = selectedChannelName !== 'Select Channel' && selectedChannelName !== '' && correspondingBase;

        uploadButton.disabled = !isValidAndConfiguredChannel;
        uploadButton.classList.toggle('inactive-btn', !isValidAndConfiguredChannel);

        if (adminMode) {
            if (isValidAndConfiguredChannel) {
                console.log(`Selected ${selectedChannelName} (Base ID: ${correspondingBase.id}). Upload button enabled.`);
            } else if (selectedChannelName !== 'Select Channel' && selectedChannelName !== '') {
                console.log(`No Base ID found for ${selectedChannelName}. Upload button disabled.`);
            } else {
                console.log("No channel selected, or 'Select Channel' chosen. Upload button disabled.");
            }
        }
    });
    // Initial state: disable button until a valid, configured channel is selected
    uploadButton.disabled = true;
    uploadButton.classList.add('inactive-btn');
}
