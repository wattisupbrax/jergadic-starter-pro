import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">JergaDic</h1>
          <p className="text-gray-600">El diccionario de jerga más chévere</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-blue-600">
          <SignIn 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-none bg-transparent',
                headerTitle: 'text-2xl font-bold text-blue-800',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50 rounded-lg',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold',
                formFieldInput: 'border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
                footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
              },
            }}
          />
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>¿Primera vez aquí? <a href="/sign-up" className="text-blue-600 hover:text-blue-700 font-medium">Únete a la comunidad</a></p>
        </div>
      </div>
    </div>
  )
}