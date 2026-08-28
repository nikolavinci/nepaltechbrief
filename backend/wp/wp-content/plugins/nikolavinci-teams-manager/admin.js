@
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
        });
        mediaUploader.on("select", function() {
            var attachment = mediaUploader.state().get("selection").first().toJSON();
            $(targetInput).val(attachment.url);
            previewArea.html("<img src=\"" + attachment.url + "\">");
        });
        mediaUploader.open();
    });
    $(".nv-remove-btn").click(function(e) {
        e.preventDefault();
        var targetInput = $(this).data("target");
        $(targetInput).val("");
        $(this).siblings(".preview-area").html("");
    });
});
@
