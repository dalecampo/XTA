//START OF TRACK()

export function track(filename, provider, category) {
  // Check if the provider or category is "Waiting..."
  if (provider === "Waiting..." || category === "Waiting...") {
    return "Waiting for info...";
  }
  if (provider === "SELECT MANUALLY" || category === "SELECT PROVIDER") {
    return "ADD CLIP URL MANUALLY";
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
      return "FIX CLIP NAME";
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
  if (category === "YouTube") {
    const regex = /_(.{11})_YT.mp4/;
    const match = filename.match(regex);

    if (filename.indexOf(")_") === -1) {
      return "FIX CLIP NAME";
    }
    if (match) {
      const videoId = match[1];
      return "https://www.youtube.com/watch?v=" + videoId;
    } else {
      return null;
    }
  }

  else {
    return "ADD CLIP URL MANUALLY";
  }
}

//END OF TRACK()










//START OF PROVIDER()

export function provider(filename) {
  if (filename == "") {
    return "Waiting...";
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
  if (filename.indexOf("ContentBible") != -1) {
    return "CONTENTbible";
  }
  if (filename.indexOf("GPB_Master") != -1) {
    return "GoPro";
  }
  if (filename.indexOf("mixkit") != -1) {
    return "Mixkit";
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
  return "SELECT MANUALLY";
}

//END OF PROVIDER()










//START OF CATEGORY()

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
      case "Newsflare":
        return "Paid License";
      case "NOAA":
        return "Free Stock Footage";
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
    return "SELECT PROVIDER";
  }

//END OF CATEGORY()










//START OF CLIPID

export function needsClipID(provider) {
  if (provider === "Red Bull") {
    return "ADD CLIP ID";
  }
}

//END OF CLIP ID










//START OF USERNAME

function username(filename) {
  const regex = /\((.*?)\)/; // create regex to match text between parentheses
  const match = filename.match(regex); // find first match of regex in filename
  if (match) {
    return match[1]; // return text between parentheses
  }
  return null; // return null if no match is found
}

//END OF USERNAME






/*
// QUICK TEST
const testFile = "MI202106180013_h264_1080p.mp4";

console.log("Test File: ");
console.log(testFile);
console.log("");

console.log("Provider: ");
console.log(provider(testFile));
console.log("");

console.log("Category: ");
console.log(category(testFile, provider(testFile)));
console.log("");

console.log("Clip URL: ");
console.log(track(testFile, provider(testFile), category(testFile, provider(testFile))));
console.log("");
*/

/*

//START OF MAIN TESTING - CONSTANTS DECLARATION

const artgrid = "42674_waves_rush_to_rocky_shore_with_green_grass_and_fence_on_stormy_day_by_Jakob_Owens_Artgrid-HD_H264-HD.mp4";
const artlist = "599442_Tornado, Road, Wind, Air_By_Ira_Belsky_Artlist_HD";
const contentbible = "Game of thrones fan builds a Covid Castle in his house_m179365_ContentBible.mov";
const instagram = "(louddoodle)_Ce66txEuTmW - 1_IG.mp4";
const newsflare = "Newsflare-313848-french-bulldog-puppy-dressed-i.mp4";
const pexels = "pexels-los-muertos-crew-8478021.mp4";
const pexelsTwo = "production_id_5049368 (1080p) (1).mp4";
const storyblocks = "close-up-on-sweet-macaroons-on-pink-background-delicious-desserts-SBV-332071933-HD.mov";
const tiktok = "(stephcoach1234)_7127984644422700293_TT.mp4";
const vimeo = "(OceanShutter)_Stay With Us - Part II - Stay Longer_212783769_VI.mp4";
const youtube = "(I Cook And Paint)_Super Soft & Fluffy Cinnamon Rolls Recipe_k8x_s98P4xY_YT.mp4";

//PROVIDER TESTS
console.log("");
console.log("PROVIDER TESTS");

const artgridProvider = provider(artgrid);
const artlistProvider = provider(artlist);
const contentbibleProvider = provider(contentbible);
const instagramProvider = provider(instagram);
const newsflareProvider = provider(newsflare);
const pexelsProvider = provider(pexels);
const storyblocksProvider = provider(storyblocks);
const tiktokProvider = provider(tiktok);
const vimeoProvider = provider(vimeo);
const youtubeProvider = provider(youtube);

console.log("artgridProvider: ",artgridProvider);
console.log("artlistProvider: ",artlistProvider);
console.log("contentbibleProvider: ",contentbibleProvider);
console.log("instagramProvider: ",instagramProvider);
console.log("newsflareProvider: ",newsflareProvider);
console.log("pexelsProvider: ",pexelsProvider);
console.log("storyblocksProvider: ",storyblocksProvider);
console.log("tiktokProvider: ",tiktokProvider);
console.log("vimeoProvider: ",vimeoProvider);
console.log("youtubeProvider: ",youtubeProvider);

console.log("");

//CATEGORY TESTS
console.log("CATEGORY TESTS");

const artgridCategory = category(artgrid, artgridProvider);
const artlistCategory = category(artlist, artlistProvider);
const contentbibleCategory = category(contentbible, contentbibleProvider);
const instagramCategory = category(instagram, instagramProvider);
const newsflareCategory = category(newsflare, newsflareProvider);
const pexelsCategory = category(pexels, pexelsProvider);
const storyblocksCategory = category(storyblocks, storyblocksProvider);
const tiktokCategory = category(tiktok, tiktokProvider);
const vimeoCategory = category(vimeo, vimeoProvider);
const youtubeCategory = category(youtube, youtubeProvider);

console.log("artgridCategory: ", artgridCategory);
console.log("artlistCategory: ", artlistCategory);
console.log("contentbibleCategory: ", contentbibleCategory);
console.log("instagramCategory: ", instagramCategory);
console.log("newsflareCategory: ", newsflareCategory);
console.log("pexelsCategory: ", pexelsCategory);
console.log("storyblocksCategory: ", storyblocksCategory);
console.log("tiktokCategory: ", tiktokCategory);
console.log("vimeoCategory: ", vimeoCategory);
console.log("youtubeCategory: ", youtubeCategory);

console.log("");

//TRACK TESTS
console.log("TRACK TESTS");

const artgridTrack = track(artgrid, artgridProvider, artgridCategory);
const artlistTrack = track(artlist, artlistProvider, artlistCategory);
const contentbibleTrack = track(contentbible, contentbibleProvider, contentbibleCategory);
const instagramTrack = track(instagram, instagramProvider, instagramCategory);
const newsflareTrack = track(newsflare, newsflareProvider, newsflareCategory);
const pexelsTrack = track(pexels, pexelsProvider, pexelsCategory);
const storyblockTrack = track(storyblocks, storyblocksProvider, storyblocksCategory);
const tiktokTrack = track(tiktok, tiktokProvider, tiktokCategory);
const vimeoTrack = track(vimeo, vimeoProvider, vimeoCategory);
const youtubeTrack = track(youtube, youtubeProvider, youtubeCategory);

console.log("artgridTrack: ", artgridTrack);
console.log("contentbibleTrack: ", contentbibleTrack);
console.log("instagramTrack: ", instagramTrack);
console.log("newsflareTrack: ", newsflareTrack);
console.log("pexelsTrack: ", pexelsTrack);
console.log("storyblockTrack: ", storyblockTrack);
console.log("tiktokTrack: ", tiktokTrack);
console.log("vimeoTrack: ", vimeoTrack);
console.log("youtubeTrack: ", youtubeTrack);

// Test anything as needed here by un-commenting lines:
//console.log("");
//console.log();
//console.log(provider("(FailArmy)_Super Soft & Fluffy Cinnamon Rolls Recipe_k8x_s98P4xY_YT.mp4"));
//console.log(category());

//END OF TESTS
console.log("");
console.log("END OF TESTS");
console.log("");

*/