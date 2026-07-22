import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center p-8 font-sans">
      <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-extrabold text-gray-950">404 - Page Not Found</h2>
        <p className="text-xs text-gray-550 font-semibold leading-relaxed">
          The page or resource you are trying to access does not exist.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-colors"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}
