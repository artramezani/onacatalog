export const instant = false

export default async function ViewPage({ params }: PageProps<'/view/[slug]'>) {
  const { slug } = await params

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p>در حال بارگذاری کاتالوگ: {slug}</p>
    </main>
  )
}
