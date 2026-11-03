"""Textura sonora original de fogo: ar quente, combustão grave e estalos de madeira.
Geração determinística, sem gravações externas. Requer numpy, scipy e ffmpeg.
"""
from pathlib import Path
import subprocess
import tempfile
import wave
import numpy as np
from scipy.fft import rfft, irfft, rfftfreq

sr, duracao = 44100, 24
n = sr * duracao
rng = np.random.default_rng(20261103)
freq = rfftfreq(n, 1 / sr)
t = np.arange(n) / sr

def ruido(de, ate, inclinacao=0):
    branco = rng.standard_normal(n)
    forma = (1 - np.exp(-(freq / de)**4)) * np.exp(-(freq / ate)**4)
    forma *= np.maximum(freq, de) ** (-inclinacao)
    v = irfft(rfft(branco) * forma, n)
    return v / max(np.std(v), 1e-9)

# Modulação periódica lenta; a emenda do loop não altera a intensidade.
respirar = .76 + .12 * np.sin(2*np.pi*t/duracao*3) + .09*np.sin(2*np.pi*t/duracao*7 + .7)
base = ruido(45, 480, .7) * .095 * respirar + ruido(550, 5800, .35) * .021 * respirar
estereo = np.stack([base.copy(), base.copy()], axis=1)
for canal in range(2):
    estereo[:, canal] += ruido(300, 3800, .4) * .014

# Estalos grandes ocasionais, microcrepitação mais densa e panorama estreito natural.
for i in range(450):
    inicio = rng.integers(n)
    grande = rng.random() < .055
    dur = rng.uniform(.025, .16) if grande else rng.uniform(.004, .035)
    k = max(12, int(sr*dur)); tt = np.arange(k)/sr
    ataque = 1 - np.exp(-tt / .0004)
    env = ataque * np.exp(-tt / (dur*.18))
    tecido = rng.standard_normal(k) * .65 + np.sin(2*np.pi*rng.uniform(1300,5200)*tt)*.35
    estalo = tecido * env * (rng.uniform(.10,.24) if grande else rng.uniform(.008,.055))
    pan = rng.uniform(.15,.85)
    idx = (inicio + np.arange(k)) % n
    estereo[idx, 0] += estalo * np.sqrt(1-pan)
    estereo[idx, 1] += estalo * np.sqrt(pan)
# Saturação muito suave; folga evita clipping na soma com os sons musicais.
estereo = np.tanh(estereo * 1.25)
estereo *= .65 / max(np.max(np.abs(estereo)), 1e-9)
pcm = (estereo * 32767).astype('<i2')
raiz = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as d:
    wav = Path(d)/'fogo.wav'
    with wave.open(str(wav), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(sr); f.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','160k','-metadata','title=Fogo - Guitarra Facil',str(raiz/'sons'/'fogo.mp3')], check=True)
print(f'{duracao}s estéreo; pico {np.max(np.abs(estereo)):.3f}; RMS {np.sqrt(np.mean(estereo**2)):.3f}')
