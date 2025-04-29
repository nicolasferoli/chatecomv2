import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Chat E-commerce App
        </h1>
        
        <div className="space-y-4">
          <p className="text-center">Por favor, faça login para continuar.</p>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 