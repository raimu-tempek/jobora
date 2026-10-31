interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = "atau" }: AuthDividerProps) {
  return (
    <div className="relative my-5 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[#e2eaf0]" />
      </div>
      <div className="relative px-3 bg-white text-[11.5px] uppercase tracking-wider font-semibold text-gray-400">
        {text}
      </div>
    </div>
  );
}
