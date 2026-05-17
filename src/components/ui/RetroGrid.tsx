'use client'

export function RetroGrid({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden [perspective:200px] opacity-50 ${className}`}
    >
      {/* Grid */}
      <div className="absolute inset-0 [transform:rotateX(35deg)]">
        <div
          className="animate-grid [background-repeat:repeat] [background-size:60px_60px] [height:300%] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:200%]
          [background-image:linear-gradient(to_right,rgba(34,197,94,0.15)_1px,transparent_0),linear-gradient(to_bottom,rgba(34,197,94,0.15)_1px,transparent_0)]"
        />
      </div>

      {/* Shadow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent to-90%" />
    </div>
  )
}
