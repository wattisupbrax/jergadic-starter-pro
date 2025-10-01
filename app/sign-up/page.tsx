import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">JergaDic</h1>
          <p className="text-gray-600">Únete a la comunidad de jerga</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-green-500">
          <SignUp 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-none bg-transparent',
                headerTitle: 'text-2xl font-bold text-blue-800',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50 rounded-lg',
                formButtonPrimary: 'bg-green-600 hover:bg-green-700 rounded-lg font-semibold',
                formFieldInput: 'border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200',
                footerActionLink: 'text-green-600 hover:text-green-700 font-medium',
              },
            }}
          />
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>¿Ya tienes cuenta? <a href="/sign-in" className="text-green-600 hover:text-green-700 font-medium">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  )
}