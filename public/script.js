document.getElementById('videoForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const url = document.getElementById('url').value;
    const quality = document.getElementById('quality').value;
    const type = document.getElementById('type').value;
    const responseMessage = document.getElementById('responseMessage');

    responseMessage.classList.add('hidden');

    try {
        const response = await fetch(`/api/v1/video?url=${encodeURIComponent(url)}&quality=${quality}&type=${type}`);
        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${type}_${quality}.mp4`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } else {
            const result = await response.json();
            responseMessage.textContent = result.message;
            responseMessage.classList.remove('hidden');
        }
    } catch (error) {
        responseMessage.textContent = 'An error occurred. Please try again.';
        responseMessage.classList.remove('hidden');
    }
});
