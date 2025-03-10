import { Button } from "@/components/ui/button"

export default function AccessDenied() {

  const handleLogin = () => {
    window.location.href = "/login"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <LockIcon className="h-12 w-12" />
      <h1 className="text-3xl font-bold mt-4">Access Denied</h1>
      <p className="mt-2">Sorry, you must be logged into your Google Account to use StarTime.</p>
      <Button variant="outline" className="mt-8" onClick={handleLogin}>
        Log In
      </Button>
    </div>
  )
}

interface LockIconProps extends React.SVGProps<SVGSVGElement> {}

function LockIcon(props: LockIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
