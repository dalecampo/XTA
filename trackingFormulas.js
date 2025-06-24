export function track(filename, provider, category) {
  // Check if the provider or category is "Waiting..."
  if (provider === "Waiting..." || category === "Waiting...") {
    return "Waiting for info...";
  }
  if (provider === "" || category === "") {
    return "";
  }
  
  // Check if the provider is ArtGrid
  if (provider === "Artgrid") {
    // Return the video URL
    return "https://www.artgrid.io/clip/" + filename.split("_")[0];
  }

  // Check if the provider is Artlist
  if (provider === "Artlist") {
    // Return the video URL
    return "https://artlist.io/stock-footage/clip/description/" + filename.split("_")[0];
  }

  // Check if the provider is Caters
  if (provider === "Caters") {
    const regex = /_(\d+)\.mp4$/;
    const match = filename.match(regex);
  
    if (match) {
      const id = match[1];
      return "https://clips.catersnews.com/#/clip/" + id;
    } else {
      return null;
    }
  }  

  // Check if the provider is ContentBible
  if (provider === "CONTENTbible") {
    // Return the video URL
    return "https://www.thecontentbible.com/record/" + filename.match(/(\d+)_ContentBible.mov/)[1];
  }

  // Check if the provider is GoPro
  if (provider === "GoPro") {
    // Return the video URL
    return "https://partner.gopro.com/#/media?per_page=20&search=" + filename + "&page=1";
  }

  // Check if the provider is Motion Array
  if (provider === "Motion Array") {
    const regex1 = /_(original|fhd)_([0-9]+)\.(mp4|mov)$/;
    const regex2 = /_(original|fhd)_([0-9]+)_[0-9]+\.(mp4|mov)$/;
    let match = filename.match(regex1);

    if (!match) {
      match = filename.match(regex2);
    }

    if (match) {
      const id = match[2]; // Extract the first numeric ID
      return "https://motionarray.com/browse/stock-video/?q=" + id;
    } else {
      return null;
    }
  }

  // Check if the provider is Newsflare
  if (provider === "Newsflare") {
    // Return the video URL
    return "https://www.newsflare.com/video/" + filename.match(/Newsflare-(\d+)/)[1];
  }

  // Check if the provider is Pexels
  if (provider === "Pexels") {
    // Check if the number of underscores in the filename is 2
    const regex = /(\d{7})/;
    const match = filename.match(regex);

    if (match) {
      const videoId = match[0];
      return "https://www.pexels.com/video/" + videoId;
    } else {
      return null;
    }
  }

  if (provider === "Red Bull") {
    const regex = /(MI\d+)/;
    const match = filename.match(regex);

    if (match) {
      const vin = match[0];
      return "https://www.redbullcontentpool.com/search?q=" + vin;
    } else {
      return null;
    }
  }

  // Check if the provider is Storyblocks
  if (provider === "Storyblocks") {
    // Return the video URL
    return "https://www.storyblocks.com/all-video/search/" + filename.match(/SBV-[0-9]+/)[0];
  }

  // Check if the category is TikTok
  if (category === "TikTok") {
    const regex = /\(([^)]+)\)_([^_]+)_TT.mp4/;
    const match = filename.match(regex);
    return "https://www.tiktok.com/@" + match[1] + "/video/" + match[2];
  }

  // Check if the category is Instagram
  if (category === "Instagram") {
    let regex;

    if (filename.indexOf(")_") === -1) {
      return "";
    }
    // If the file name includes spaces, extract the value between ")" and the first space
    // This covers cases where an IG post has several videos and each is indexed like " - #_IG.mp4"
    if (filename.includes(" ")) {
      regex = /\)_([^ ]*)/;
    } else {
      // If the file name has no spaces, extract the value between ")_" and "_IG.mp4"
      regex = /\)\_(.*?)\_IG\.mp4/;
    }
    const match = filename.match(regex);
    if (match) {
      return "https://www.instagram.com/p/" + match[1];
    } else {
      return null;
    }
  }

  // Check if the category is Vimeo
  if (category === "Vimeo") {
    return "https://www.vimeo.com/" + filename.split("_")[filename.split("_").length - 2];
  }

  // Check if the category is YouTube
  if (category === "YouTube" || (filename.slice(-6) == "YT.mp4")) {
    const regex = /_(.{11})_YT.mp4/;
    const match = filename.match(regex);

    if (filename.indexOf(")_") === -1) {
      return "";
    }
    if (match) {
      const videoId = match[1];
      return "https://www.youtube.com/watch?v=" + videoId;
    } else {
      return null;
    }
  }

  else {
    return "";
  }
}





export function provider(filename) {
  if(filename.startsWith("NostalgiaTV_")) {
    return "No License";
  }
  if (filename.slice(-6) == "YT.mp4") {
    let contributor = username(filename);

    if (contributor === "NASA") {
      return "NASA";
    } else if (contributor === "FailArmy" || contributor === "Jukin" || contributor === "People Are Awesome" || contributor === "The Pet Collective" ) {
      return "Jukin (clip)"
    } else {
      return "Contributor Content";
    }
  }
  if (filename.slice(-6) == "IG.mp4" || filename.slice(-6) == "TT.mp4" || filename.slice(-6) == "VI.mp4") {
    return "Contributor Content";
  }
  if (filename.slice(0, 3) == "AFV") {
    return "AFV";
  }
  if (filename.indexOf("Artlist") != -1) {
    return "Artlist";
  }
  if (filename.indexOf("Artgrid") != -1) {
    return "Artgrid";
  }
  if (filename.split("_")[0] == "CATERS") {
    return "Caters";
  }
  if (filename.indexOf("ContentBible") != -1) {
    return "CONTENTbible";
  }
  if (filename.indexOf("GPB_Master") != -1) {
    return "GoPro";
  }
  if (filename.indexOf("mixkit") != -1) {
    return "Mixkit";
  }
  if (/_(original|fhd)_([0-9]+)\.(mp4|mov)$/.test(filename)) {
    return "Motion Array";
  }
  if (/_(original|fhd)_[0-9]+_[0-9]+\.(mp4|mov)$/.test(filename)) {
    return "Motion Array";
  }
  if (/^MI[0-9]+/.test(filename)) {
    return "Red Bull";
  }
  if (/SBV-[0-9]+/.test(filename)) {
    return "Storyblocks";
  }
  if (filename.indexOf("Newsflare") != -1) {
    return "Newsflare";
  }
  if (filename.indexOf("pexels") != -1 || filename.indexOf("production_id_") != -1) {
    return "Pexels";
  }
  if (filename.indexOf("Storyful") != -1) {
    return "Storyful";
  }
  if (filename.indexOf("UGC_perpetual") != -1 || filename.indexOf("UGC_CONTEST") != -1) {
    return "UGC";
  }
  if (filename.slice(0, 2) == "VV") {
    return "Viral Video UK";
  }
  if (filename.indexOf("ViralHog") != -1) {
    return "ViralHog";
  }
  return ""; // This was "SELECT MANUALLY"
}





export function category(filename, provider) {
  if (!filename) {
    return "Waiting...";
  }
  switch (provider) {
    case "NASA":
      return "Public Domain";
    case "513 Media":
      return "Paid License";
    case "AFV":
      return "Paid License";
    case "Artgrid":
      return "Paid Stock Footage";
    case "Artlist":
      return "Paid Stock Footage";
    case "BViral":
      return "Paid License";
    case "Caters":
      return "Paid License";
    case "Collab":
      return "Paid License";
    case "CONTENTbible":
      return "Paid License";
    case "Devin Supertramp":
      return "Paid License";
    case "Doing Things Media":
      return "Paid License";
    case "GoPro":
      return "Barter";
    case "Jukin":
      return "Paid License";
    case "LPE360":
      return "Paid License";
    case "Mixkit":
      return "Free Stock Footage";
    case "Motion Array":
        return "Paid Stock Footage";
    case "Newsflare":
      return "Paid License";
    case "NOAA":
      return "Free Stock Footage";
    case "No License":
        return "Nostalgia TV";
    case "OTV":
      return "Barter";
    case "Pexels":
      return "Free Stock Footage";
    case "Quattro":
      return "Paid License";
    case "Red Bull":
      return "Barter";
    case "Rumble":
      return "Paid License";
    case "Storyblocks":
      return "Free Stock Footage";
    case "Storyful":
      return "Paid License";
    case "TasteMade":
      return "Barter";
    case "UGC":
      return "UGC - Perpetual";
    case "Videvo":
      return "Paid Stock Footage";
    case "Viral Video UK":
      return "Paid License";
    case "ViralHog":
      return "Paid License";
    default:
      if (filename.endsWith("IG.mp4")) {
        return "Instagram";
      } else if (filename.endsWith("YT.mp4")) {
        return "YouTube";
      } else if (filename.endsWith("VI.mp4")) {
        return "Vimeo";
      } else if (filename.endsWith("TT.mp4")) {
        return "TikTok";
      } else if (filename.endsWith("TW.mp4")) {
        return "Twitter";
      }
  }
  return ""; // This was "SELECT PROVIDER"
}





export function needsClipID(provider) {
  if (provider === "Red Bull") {
    return "ADD CLIP ID";
  }
}





function username(filename) {
  const regex = /\((.*?)\)/; // create regex to match text between parentheses
  const match = filename.match(regex); // find first match of regex in filename
  if (match) {
    return match[1]; // return text between parentheses
  }
  return null; // return null if no match is found
}