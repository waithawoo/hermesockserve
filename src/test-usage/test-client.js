import express from 'express';
import path from 'path';

const PORT = 8000;
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.resolve('src/test-usage/ws_test_client.html'))
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


