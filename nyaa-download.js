// ==UserScript==
// @name        nyaa.si Direct Download Button
// @description Adds a "Download" button which downloads all selected torrent files directly
// @homepage    https://github.com/Johnsen92/nyaa_downloader
// @version     2.0.0
// @grant       none
// @license     MIT
// @require     https://code.jquery.com/jquery-3.5.1.min.js
// @include     *nyaa.si/*
// @exclude     *nyaa.si/rules
// @exclude     *nyaa.si/help
// @exclude     *nyaa.si/upload
// ==/UserScript==

// Download selected torrent files directly
function downloadTorrents() {
  // Find all checked rows
  const checkedRows = $("table.torrent-list tbody tr").filter(function() {
    return $(".ckbox", this).is(":checked");
  });
  
  if (checkedRows.length === 0) {
    alert("No torrents selected. Please select at least one torrent.");
    return;
  }
  
  // Show download progress
  const progressDiv = $("<div>").attr("id", "download-progress")
    .css({
      "position": "fixed",
      "bottom": "10px",
      "left": "10px",
      "background": "rgba(0,0,0,0.8)",
      "color": "white",
      "padding": "10px",
      "border-radius": "5px",
      "z-index": "9999"
    })
    .html("Preparing to download " + checkedRows.length + " torrent file(s)...")
    .appendTo("body");
  
  let downloadCount = 0;
  
  // Process each row sequentially with a delay
  function processNextRow(index) {
    if (index >= checkedRows.length) {
      // All downloads completed
      progressDiv.html("Downloaded " + downloadCount + " torrent file(s) successfully!");
      setTimeout(() => {
        progressDiv.fadeOut(500, function() { $(this).remove(); });
      }, 3000);
      return;
    }
    
    const row = $(checkedRows[index]);
    
    // Extract torrent ID from the title link
    const titleLink = row.find("td a[href^='/view/']").first();
    if (titleLink.length === 0) {
      console.warn("Could not find title link in row:", row);
      setTimeout(() => processNextRow(index + 1), 500);
      return;
    }
    
    const torrentId = titleLink.attr("href").match(/\/view\/(\d+)/);
    if (!torrentId || !torrentId[1]) {
      console.warn("Could not extract torrent ID from:", titleLink.attr("href"));
      setTimeout(() => processNextRow(index + 1), 500);
      return;
    }
    
    // Create download URL
    const downloadUrl = window.location.origin + "/download/" + torrentId[1] + ".torrent";
    const torrentName = titleLink.text().trim() || "torrent-" + torrentId[1];
    
    // Update progress
    downloadCount++;
    progressDiv.html("Downloading " + downloadCount + " of " + checkedRows.length + ":<br>" + torrentName);
    
    // Create and click a temporary download link
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = torrentName.replace(/[/\\?%*:|"<>]/g, '_') + ".torrent";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Process the next row after a delay
    setTimeout(() => processNextRow(index + 1), 1000);
  }
  
  // Start processing rows
  processNextRow(0);
}

// Add checkboxes to every row of the search results
$("table.torrent-list thead tr").prepend("<th class=\"hdr-select\" style=\"width: 10px\"></th>");
$("table.torrent-list tbody tr").each(function(){
  $(this).prepend("<td class=\"row-select\" style=\"width: 10px\"><input checked class=\"ckbox\" type=\"checkbox\"></td>");
});

// Widen search input field
$(".form-control.search-bar").css("width","455px");

// Add 'Download' button to page
if(document.getElementById("download-all") == null){
  $(".nav.navbar-nav.navbar-right").append("<li><button style=\"margin-top: 9px\" class=\"btn btn-primary\" id=\"download-all\">Download</button></li>");
  document.getElementById("download-all").addEventListener('click', downloadTorrents, false);
}
