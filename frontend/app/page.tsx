import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect visitors from the homepage to the shop catalog
  redirect('/shop/catalog');
}
