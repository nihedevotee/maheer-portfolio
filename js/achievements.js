// Vercel serverless function: reads the public GitHub profile page and returns
// the achievement badges currently shown there, so the portfolio stays in sync.
const USER = "nihedevotee";

module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://github.com/${USER}`, {
      headers: { "User-Agent": "Mozilla/5.0 (MaheerOS portfolio)", "Accept": "text/html" }
    });
    if (!r.ok) throw new Error(`GitHub responded ${r.status}`);
    const html = await r.text();

    const seen = new Set();
    const achievements = [];
    const re = /<a href="([^"]*achievement=([a-z0-9-]+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
    let m;
    while ((m = re.exec(html))) {
      const slug = m[2];
      if (seen.has(slug)) continue;
      const img = /<img[^>]*src="([^"]+)"[^>]*alt="Achievement:\s*([^"]+)"/.exec(m[3])
               || /<img[^>]*alt="Achievement:\s*([^"]+)"[^>]*src="([^"]+)"/.exec(m[3]);
      if (!img) continue;
      const src = img[1].startsWith("http") ? img[1] : img[2];
      const name = img[1].startsWith("http") ? img[2] : img[1];
      const tier = /(x\d+)/.exec(m[3].replace(/<img[^>]*>/g, ""));
      seen.add(slug);
      achievements.push({
        slug,
        name: name.trim(),
        image: src,
        tier: tier ? tier[1] : "",
        url: `https://github.com/${USER}?achievement=${slug}&tab=achievements`
      });
    }

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ achievements });
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) });
  }
};