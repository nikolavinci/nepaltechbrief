'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api'; // Or standard fetch with headers

export default function SettingsPage() {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Fetch settings on load
    fetch(process.env.NEXT_PUBLIC_API_URL + '/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          if (data.data.ai_provider) setProvider(data.data.ai_provider);
          if (data.data.ai_api_key) setApiKey(data.data.ai_api_key);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    setStatus('Saving...');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          settings: {
            ai_provider: provider,
            ai_api_key: apiKey
          }
        })
      });
      if (res.ok) {
        setStatus('Settings saved successfully!');
      } else {
        setStatus('Failed to save settings.');
      }
    } catch (e) {
      setStatus('Error saving settings.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">AI Settings Configuration</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">AI Provider</label>
          <select 
            value={provider} 
            onChange={e => setProvider(e.target.value)}
            className="w-full border rounded p-2 bg-background"
          >
            <option value="openai">OpenAI (ChatGPT)</option>
            <option value="gemini">Google Gemini</option>
            <option value="anthropic">Anthropic (Claude)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">API Key</label>
          <input 
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full border rounded p-2 bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This key will be used by the automated news sync system to translate and spin incoming RSS feeds.
          </p>
        </div>

        <button 
          onClick={handleSave}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          Save Settings
        </button>

        {status && <p className="mt-2 text-sm text-green-600 font-medium">{status}</p>}
      </div>
    </div>
  );
}
