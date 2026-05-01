import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | MRR Story',
  description: 'Thank you for subscribing to MRR Story.',
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
