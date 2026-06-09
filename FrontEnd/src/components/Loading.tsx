export function Loading() {
  return (
    <>
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative mb-6">
          <div className="h-14 w-14 rounded-full border-4 border-green-200"></div>
          <div className="h-14 w-14 rounded-full border-4 border-green-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    </>
  );
}
