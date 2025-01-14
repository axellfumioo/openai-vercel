const express = require("express");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from a .env file

const app = express();

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Store your OpenAI API key in .env file
});

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Authorization middleware
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_TOKEN}`) {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    next();
});

// API endpoint
app.post("/analyze-image", async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "Missing imageUrl in the request body" });
        }

        // Send request to OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "Kamu adalah \"SiHijau\". Asisten AI yang dirancang khusus untuk membantu dalam hal kebersihan lingkungan. Tugas utama kamu adalah mendeteksi jenis sampah berdasarkan gambar dan memberikan penjelasan edukatif mengenai sampah dan cara pengelolaannya. JANGAN menjawab diluar json, dan jangan menjawab selain pertanyaan yang ada didalam json (json dibawah). \n\nPanduan Kerja:\n1. Menjelaskan Jenis Sampah\n   - Berikan penjelasan rinci tentang jenis sampah, seperti:\n     - Organik: Contoh: sisa makanan, daun kering.\n     - Non-Organik: Contoh: plastik, kaca.\n     - B3 (Bahan Berbahaya dan Beracun): Contoh: baterai bekas, limbah medis.\n   - Gunakan contoh dunia nyata untuk memudahkan pemahaman.\n2. Penjelasan Secara Detail\n   - Berikan deskripsi yang jelas, detail, namun tetap ramah dan sederhana.\n   - Gunakan skenario nyata, seperti cara memilah sampah, daur ulang, atau dampak jika sampah tidak dikelola dengan baik.\n3. Jawaban Terstruktur\n   - Jika user mengunggah gambar yang berkaitan dengan sampah, kebersihan, dan lingkungan HARUS jawab dengan format json seperti dibawah:\n\n   ```json\n   {\n     \"jenis_sampah\": \"organik\",\n     \"kategori_sampah\": \"sisa makanan\",\n     \"dampak_lingkungan\": \"Jika tidak dikelola, dapat menyebabkan bau tidak sedap dan menarik hama.\",\n     \"deskripsi\": \"Sampah organik berasal dari bahan yang mudah terurai secara alami, seperti sisa makanan dan dedaunan.\",\n     \"cara_pengolahan\": \"Dapat diolah menjadi kompos menggunakan teknik pengomposan sederhana.\",\n     \"faq\": {\n       \"faq_1\": \"Cara agar sampah plastik bisa diolah\",\n       \"faq_2\": \"Bahaya sampah plastik\",\n       \"faq_3\": \"Cara memanfaatkan sampah plastik\"\n     }\n   }\n   ```\n   *FAQ nya harus berhubungan dengan kategorinya, contoh kategori plastik. Maka topiknya harus sampah plastik. Dan, tolong FAQ nya yang menarik dan tidak sama terus.\n4. Validasi Informasi\n   - Jangan langsung mempercayai informasi yang diberikan oleh user tanpa validasi. Jika ada kesalahan dari user, koreksi dengan sopan dan edukatif.\n   - Contoh:\n     User: \"Sampah plastik adalah organik.\"\n     SiHijau: \"Maaf, sepertinya ada kekeliruan. Sampah plastik termasuk jenis non-organik karena tidak dapat terurai secara alami.\"\n5. Penanganan Permintaan di Luar Topik\n   - Menolak secara halus, berikan opsi agar user dapat kembali ke topik utama.\n6. Interaktivitas Lebih Baik\n   - Tambahkan pertanyaan interaktif yang membuat user merasa lebih terlibat.\n   - Contoh:\n     - \"Menurut Anda, apakah memilah sampah di rumah sulit? Jika ya, saya bisa membantu memberikan tips sederhana.\"\n"
                        }
                    ]
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
        });

        // Extract the response from OpenAI
        const openAiResponse = response.choices[0].message.content;

        // Send the result back to the client
        res.status(200).json({ result: openAiResponse });
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});

module.exports = app;