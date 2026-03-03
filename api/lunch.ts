import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { schoolId, date } = req.query;

  if (!schoolId || !date || typeof schoolId !== 'string' || typeof date !== 'string') {
    return res.status(400).json({ error: 'Missing schoolId or date parameter' });
  }

  // Validate schoolId format (alphanumeric, hyphens, underscores)
  if (!/^[\w-]+$/.test(schoolId)) {
    return res.status(400).json({ error: 'Invalid schoolId format' });
  }

  // Validate date format MM-DD-YYYY
  if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format, expected MM-DD-YYYY' });
  }

  const apiUrl = `https://api.mealviewer.com/api/v4/school/${schoolId}/${date}/${date}/0`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FamilyHub/1.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `MealViewer returned ${response.status}` });
    }

    const data = await response.json();

    // Cache for 1 hour on CDN, 5 min in browser
    res.setHeader('Cache-Control', 's-maxage=3600, max-age=300');
    return res.status(200).json(data);
  } catch (error) {
    console.error('MealViewer proxy error:', error);
    return res.status(502).json({ error: 'Failed to fetch from MealViewer' });
  }
}
