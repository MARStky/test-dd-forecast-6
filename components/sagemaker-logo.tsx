import Image from "next/image"

export function SageMakerLogo({ className }: { className?: string }) {
  return (
    <div className="flex flex-col items-center">
      <Image src="/images/sagemaker-logo.png" alt="Amazon SageMaker" width={64} height={64} className={className} />
    </div>
  )
}
