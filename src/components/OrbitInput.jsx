"use client";

export function OrbitInput({
  type = "text",
  placeholder,
  icon,
  ...props
}) {
  return (
    <div className="relative group mb-5 transition-all duration-300 hover:scale-[1.01]">

      {/* Soft glass outer aura (no color) */}
      <div className="absolute -inset-[1px] rounded-full bg-white/10 blur-md opacity-30 group-hover:opacity-50 transition-all duration-500" />

      {/* Water highlight reflection */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute -top-10 left-0 w-full h-20 bg-white/10 blur-2xl rotate-3 opacity-40 group-hover:opacity-60 transition-all duration-500" />
      </div>

      {/* Glass container */}
      <div className="
        relative flex items-center rounded-full
        bg-white/5
        backdrop-blur-3xl
        border border-white/10
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
        px-5 py-2
        transition-all duration-300

        group-hover:bg-white/10
        group-hover:border-white/20
        group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]

        group-focus-within:border-white/25
      ">

        <input
          type={type}
          placeholder={placeholder}
          className="
            w-full bg-transparent
             text-white/90 text-base
            placeholder:text-white/30
            outline-none
          "
          {...props}
        />

        {icon && (
          <span className="
            ml-3 text-white/70 text-lg
            transition-transform duration-300
            group-hover:scale-105
          ">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}