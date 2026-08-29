
jQuery(document).ready(function($){
    var mediaUploader;
    $(".nv-upload-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        var previewArea = $(this).siblings(".preview-area");
        
        if (mediaUploader) {
            mediaUploader.open();
            return;
        }
        mediaUploader = wp.media.frames.file_frame = wp.media({
            title: "Choose Profile Picture",
            button: { text: "Choose Picture" },
            multiple: false
            var galleryUploader;
    $(".nv-gallery-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        var previewArea = $(this).siblings(".gallery-preview-area");
        
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
                html += "<img src=\"" + attachment.url + "\" style=\"max-width:80px; margin-right:5px; margin-bottom:5px; border-radius:4px;\">";
            });
            $(targetInput).val(urls.join(","));
            previewArea.html(html);
        });
        galleryUploader.open();
    });
});
        mediaUploader.on("select", function() {
            var attachment = mediaUploader.state().get("selection").first().toJSON();
            $(targetInput).val(attachment.url);
            previewArea.html("<img src=\"" + attachment.url + "\">");
            var galleryUploader;
    $(".nv-gallery-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        var previewArea = $(this).siblings(".gallery-preview-area");
        
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
                html += "<img src=\"" + attachment.url + "\" style=\"max-width:80px; margin-right:5px; margin-bottom:5px; border-radius:4px;\">";
            });
            $(targetInput).val(urls.join(","));
            previewArea.html(html);
        });
        galleryUploader.open();
    });
});
        mediaUploader.open();
        var galleryUploader;
    $(".nv-gallery-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        var previewArea = $(this).siblings(".gallery-preview-area");
        
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
                html += "<img src=\"" + attachment.url + "\" style=\"max-width:80px; margin-right:5px; margin-bottom:5px; border-radius:4px;\">";
            });
            $(targetInput).val(urls.join(","));
            previewArea.html(html);
        });
        galleryUploader.open();
    });
});
    $(".nv-remove-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        $(targetInput).val("");
        $(this).siblings(".preview-area").html("");
        var galleryUploader;
    $(".nv-gallery-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        var previewArea = $(this).siblings(".gallery-preview-area");
        
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
                html += "<img src=\"" + attachment.url + "\" style=\"max-width:80px; margin-right:5px; margin-bottom:5px; border-radius:4px;\">";
            });
            $(targetInput).val(urls.join(","));
            previewArea.html(html);
        });
        galleryUploader.open();
    });
});
    var galleryUploader;
    $(".nv-gallery-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        var previewArea = $(this).siblings(".gallery-preview-area");
        
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
                html += "<img src=\"" + attachment.url + "\" style=\"max-width:80px; margin-right:5px; margin-bottom:5px; border-radius:4px;\">";
            });
            $(targetInput).val(urls.join(","));
            previewArea.html(html);
        });
        galleryUploader.open();
    });
});

