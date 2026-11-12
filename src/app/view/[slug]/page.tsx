export const instant = false

export default async function ViewPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p>در حال بارگذاری کاتالوگ: {slug}</p>
    </main>
  )
}
