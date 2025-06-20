
export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col justify-center items-center py-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-3"></div>
      <p className="text-lg text-primary font-medium">{text}</p>
    </div>
  );
}

    