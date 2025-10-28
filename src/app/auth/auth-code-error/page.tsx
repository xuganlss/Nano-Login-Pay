export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">认证错误</h1>
          <p className="text-gray-600 mb-6">
            抱歉，在处理您的 GitHub 登录时发生了错误。请重试。
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            返回登录
          </a>
        </div>
      </div>
    </div>
  )
}