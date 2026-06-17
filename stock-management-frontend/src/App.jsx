import { useEffect, useState } from 'react';

function App() {
    const [message, setMessage] = useState('Chargement...');

    useEffect(() => {
        fetch('http://localhost:8081/api/test')
            .then((response) => response.text())
            .then((data) => setMessage(data))
            .catch((error) => {
                console.error(error);
                setMessage('Erreur de connexion API');
            });
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
}

export default App;