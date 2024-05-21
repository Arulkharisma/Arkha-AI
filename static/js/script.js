document.getElementById('submit').addEventListener('click', function () {
    const prompt = document.getElementById('prompt').value;
    const responseElement = document.getElementById('response');
    const loadingElement = document.getElementById('loading');

    loadingElement.style.display = 'block'; // Menampilkan indikator loading

    // Membuat elemen baru untuk respons saat ini
    const currentResponseContainer = document.createElement('div');
    currentResponseContainer.className = 'response-container';

    const currentPromptElement = document.createElement('div');
    currentPromptElement.className = 'prompt';
    currentPromptElement.textContent = `Anda: ${prompt}`;

    const currentResponseElement = document.createElement('pre');
    currentResponseElement.className = 'response';

    currentResponseContainer.appendChild(currentPromptElement);
    currentResponseContainer.appendChild(currentResponseElement);
    responseElement.appendChild(currentResponseContainer);

    // Membuat koneksi EventSource ke endpoint streaming
    const eventSource = new EventSource(`/api/query?prompt=${encodeURIComponent(prompt)}`);

    // Menangani pesan yang diterima dari server
    eventSource.onmessage = function (event) {
        const responseText = event.data;
        displayTypingEffect(currentResponseElement, responseText);
    };

    // Menangani kesalahan koneksi
    eventSource.onerror = function () {
        const errorMessage = document.createElement('div');
        errorMessage.textContent = '\nError: Unable to connect to the server.';
        currentResponseElement.appendChild(errorMessage);
        loadingElement.style.display = 'none'; // Sembunyikan indikator loading
        eventSource.close();
    };

    // Menutup koneksi setelah menerima pesan selesai
    eventSource.addEventListener('end', function () {
        loadingElement.style.display = 'none'; // Sembunyikan indikator loading
        eventSource.close();
    });
});

// Fungsi untuk menampilkan efek mengetik
function displayTypingEffect(element, text) {
    let i = 0;
    function type() {
        if (i < text.length) {
            if (text.charAt(i) === '\n') {
                element.appendChild(document.createElement('br'));
            } else {
                element.appendChild(document.createTextNode(text.charAt(i)));
            }
            i++;
            setTimeout(type, 20); // Kecepatan mengetik, semakin kecil semakin cepat
        }
    }
    type();
}
