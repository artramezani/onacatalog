type Props = {
  params: Promise<{ slug: string }>
}

export default async function ViewPage({ params }: Props) {
  const { slug } = await params

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p>در حال بارگذاری کاتالوگ: {slug}</p>
    </main>
  )
}
