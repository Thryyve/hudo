export default function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-full flex flex-col -m-6">{children}</div>
}
