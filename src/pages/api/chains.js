import { promises as fs } from 'fs';

import path from 'path';

export default async function handler(req, res) {
  const jsonFilePath = path.join(process.cwd(), 'config/chains.json');
  try {
    const jsonData = await fs.readFile(jsonFilePath, 'utf8');
    const chains = JSON.parse(jsonData);
    console.log('Loaded chains.json:', chains);
    res.status(200).json(chains);
  } catch (error) {
    console.error('Error reading chains.json:', error);
    res.status(500).json({ error: 'Failed to load chains.json' });
  }
}