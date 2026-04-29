import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | MRR Stories',
  description: 'Thank you for subscribing to MRR Stories.',
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
