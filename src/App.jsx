// src/App.jsx - VERSÃO SEGURA COM VARIÁVEIS DE AMBIENTE

import { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';

// Importações do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

import './App.css';

// --- PASSO 1: Configuração Segura do Firebase ---
// O código agora lê as chaves das Variáveis de Ambiente.
// Elas começam com "VITE_" por uma exigência da ferramenta Vite.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};
// ---------------------------------------------------------

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --- Funções de Criptografia (Web Crypto API) - Nenhuma alteração aqui ---
async function generateKey() {
  const key = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
  return exportedKey.k;
}

async function encryptText(text, rawKey) {
  const key = await window.crypto.subtle.importKey('jwk', { kty: 'oct', k: rawKey, alg: 'A256GCM', ext: true }, { name: 'AES-GCM' }, false, ['encrypt']);
  const encodedText = new TextEncoder().encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, encodedText);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode.apply(null, combined));
}

async function decryptText(encryptedData, rawKey) {
  try {
    const key = await window.crypto.subtle.importKey('jwk', { kty: 'oct', k: rawKey, alg: 'A256GCM', ext: true }, { name: 'AES-GCM' }, false, ['decrypt']);
    const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);
    const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Falha na descriptografia:", error);
    return null;
  }
}


function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // idle, creating, created, reading, error
  const [createdLink, setCreatedLink] = useState('');
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const hash = window.location.hash.slice(1);
    if (hash) {
      const [id, key] = hash.split(':');
      if (id && key) {
        setStatus('reading');
        
        const docRef = doc(db, "pastes", id);
        getDoc(docRef).then(docSnap => {
          if (docSnap.exists()) {
            const { encryptedText } = docSnap.data();
            decryptText(encryptedText, key).then(decryptedText => {
              if (decryptedText) {
                setText(decryptedText);
                setStatus('idle');
              } else {
                setText('Erro: Não foi possível descriptografar este conteúdo. A chave pode estar incorreta ou os dados corrompidos.');
                setStatus('error');
              }
            });
          } else {
            setText('Erro: Conteúdo não encontrado. Pode ter sido expirado ou o link está incorreto.');
            setStatus('error');
          }
        });
      }
    }
  }, []);

  const handleSave = async () => {
    if (!text || status === 'creating') return;
    setStatus('creating');

    try {
      const key = await generateKey();
      const encryptedText = await encryptText(text, key);
      const id = nanoid(10);

      const docRef = doc(db, "pastes", id);
      await setDoc(docRef, { encryptedText: encryptedText, createdAt: new Date() });

      const link = `${window.location.origin}${window.location.pathname}#${id}:${key}`;
      setCreatedLink(link);
      setStatus('created');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setStatus('error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdLink).then(() => {
      alert('Link copiado para a área de transferência!');
    }, () => {
      alert('Falha ao copiar o link.');
    });
  };

  const handleNew = () => {
    window.location.href = window.location.origin + window.location.pathname;
  }

  return (
    <div className="container">
      <header>
        <h1>SecurePaste 🔒</h1>
        <p>Os seus textos, criptografados no seu navegador. O servidor nunca vê o conteúdo.</p>
      </header>
      
      {status === 'created' ? (
        <div className="result-view">
          <h2>O seu link seguro foi criado!</h2>
          <p>Partilhe este link. Apenas quem o tiver poderá descriptografar o conteúdo.</p>
          <div className="link-box">
            <input type="text" readOnly value={createdLink} />
            <button onClick={handleCopy}>Copiar</button>
          </div>
          <button onClick={handleNew} className="new-paste-btn">Criar Novo Paste</button>
        </div>
      ) : (
        <div className="editor-view">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole o seu texto aqui..."
            disabled={status === 'reading' || status === 'creating' || status === 'error'}
          ></textarea>
          <button onClick={handleSave} disabled={!text || status === 'creating' || status === 'reading'}>
            {status === 'creating' ? 'A criptografar...' : 'Criar Paste Seguro'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
