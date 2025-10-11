export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lapis-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-indigo-dye">BetterLingo</h1>
        <p className="text-lapis-500 mb-8">Learn languages naturally with AI</p>
        <div className="space-x-4">
          <a href="/signup" className="px-6 py-3 bg-orange text-white rounded-lg hover:bg-orange-600">
            Get Started
          </a>
          <a href="/login" className="px-6 py-3 border border-lapis-400 rounded-lg hover:bg-lapis-800 text-indigo-dye">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
