import HomeClient from './HomeClient';

async function getFeaturedData() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const [resRest, resMenu] = await Promise.all([
      fetch(`${apiBase}/restaurants?sort=popularity`, { next: { revalidate: 60 } }),
      fetch(`${apiBase}/menu/featured`, { next: { revalidate: 60 } })
    ]);
    const restaurants = await resRest.json();
    const featuredItems = await resMenu.json();
    return { restaurants, featuredItems };
  } catch (e) {
    return { restaurants: [], featuredItems: [] };
  }
}

export default async function Page() {
  const { restaurants, featuredItems } = await getFeaturedData();
  return <HomeClient restaurants={restaurants} featuredItems={featuredItems} />;
}
