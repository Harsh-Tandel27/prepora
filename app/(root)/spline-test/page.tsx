import { SplineDemo } from "@/components/landing/SplineDemo"

export default function SplineTestPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Spline 3D Component Test
        </h1>
        <SplineDemo />
      </div>
    </div>
  )
}
