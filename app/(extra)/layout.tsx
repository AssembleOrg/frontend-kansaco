import Navbar from '@/components/landing/Navbar';

export default function ExtraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
