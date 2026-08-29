jQuery(document).ready(function($){
    var mediaUploader;
    
    // Profile Picture Uploader
    $(".nv-upload-trigger").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        var previewArea = $(this);
        
        if (mediaUploader) {
            mediaUploader.open();
            return;
        }
        mediaUploader = wp.media.frames.file_frame = wp.media({
            title: "Choose Profile Picture",
            button: { text: "Choose Picture" },
            multiple: false
        });
        mediaUploader.on("select", function() {
            var attachment = mediaUploader.state().get("selection").first().toJSON();
            $(targetInput).val(attachment.url);
            previewArea.html("<img src=\"" + attachment.url + "\" style=\"width:100%; height:100%; object-fit:cover;\">");
        });
        mediaUploader.open();
    });
    
    // Remove Profile Picture
    $(".nv-remove-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        $(targetInput).val("");
        var svgHtml = '<svg style="width:40px; height:40px; color:#94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
        $(".nv-upload-trigger[data-target='" + targetInput + "']").html(svgHtml);
    });

    var galleryUploader;
    
    // Gallery Uploader
    $(".nv-gallery-trigger").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        var previewArea = $(this);
        
        if (galleryUploader) {
            galleryUploader.open();
            return;
        }
        galleryUploader = wp.media.frames.file_frame = wp.media({
            title: "Choose Gallery Images",
            button: { text: "Add to Gallery" },
            multiple: true
        });
        galleryUploader.on("select", function() {
            var selection = galleryUploader.state().get("selection");
            var urls = [];
            var html = "";
            selection.map(function(attachment) {
                attachment = attachment.toJSON();
                urls.push(attachment.url);
                html += "<img src=\"" + attachment.url + "\" style=\"width:80px; height:80px; object-fit:cover; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.1);\">";
            });
            $(targetInput).val(urls.join(","));
            previewArea.html(html);
        });
        galleryUploader.open();
    });
    
    // Remove Gallery
    $(".nv-remove-gallery-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        $(targetInput).val("");
        var emptyHtml = '<div style="width:100%; text-align:center; color:#94a3b8;"><svg style="width:30px; height:30px; margin:0 auto; display:block; margin-bottom:5px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>Click to add gallery images</div>';
        $(".nv-gallery-trigger[data-target='" + targetInput + "']").html(emptyHtml);
    });
});
