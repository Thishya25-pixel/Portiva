// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-gray-500">
      <div className="flex justify-center gap-6 mb-2">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms & Conditions</Link>
        <Link href="/refund">Refund Policy</Link>
        <Link href="/contact">Contact Us</Link>
      </div>
      <p>© {new Date().getFullYear()} Portiva. All rights reserved.</p>
    </footer>
  );
}