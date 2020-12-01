$(document).on('click', '.view-video', function () {
    const videoUrl = $(this).attr("videourl")
    const videoPoster = $(this).attr("poster")
    if (videoUrl === "") return;
    const video = `<video controls="" src="${videoUrl}" poster="${videoPoster}" width="720"></video></div>`
    openModal(video)
});
$(document).on('click', '.close-modal', function () {
    //$(".modal-window video").get(0).pause()
    console.log('close -video');
});
