import { DemandForecastingDemo } from "@/components/demand-forecasting-demo"
import { ChatInterface } from "@/components/chat-interface"
import { AwsLogo } from "@/components/aws-logo"
import { SageMakerLogo } from "@/components/sagemaker-logo"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-8 mb-2">
              <AwsLogo className="h-10 w-auto" />
              <SageMakerLogo className="h-16 w-auto" />
            </div>
            <span className="text-2xl font-medium text-gray-800">Amazon SageMaker</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Retail Demand Forecasting</h1>
          <p className="mt-4 text-lg text-gray-600">Powered by Amazon SageMaker Autopilot</p>

          <div className="mt-6 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Transform Your Business with ML-Powered Forecasting
            </h2>
            <p className="text-gray-600">
              Forecasting helps businesses predict future events and make data-driven decisions. With Amazon SageMaker
              Autopilot, you can automatically select and tune the best algorithms for your data, building ML models
              that optimize inventory, set accurate sales goals, or guide investment decisions—without requiring ML
              expertise.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-md">
                <h3 className="font-medium text-blue-700">Inventory Optimization</h3>
                <p className="text-blue-600">Reduce costs by predicting optimal stock levels</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-md">
                <h3 className="font-medium text-purple-700">Sales Planning</h3>
                <p className="text-purple-600">Set realistic targets based on predicted demand</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-md">
                <h3 className="font-medium text-amber-700">Resource Allocation</h3>
                <p className="text-amber-600">Efficiently allocate resources where they're needed most</p>
              </div>
            </div>
          </div>
        </div>
        <DemandForecastingDemo />
        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">Ask About SageMaker Autopilot</h2>
          <p className="mb-6 text-gray-600">
            Have questions about how Amazon SageMaker Autopilot works? Our AI assistant powered by Amazon Bedrock can
            help you understand how to leverage automated machine learning for your business.
          </p>
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
