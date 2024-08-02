'use client'

import { useState } from 'react'



type ScreeningResult = {
  error: boolean
  result: 'Hit' | 'Clear'
  matches?: {
    name: boolean
    birthYear: boolean
    country: boolean
  }
} & (
  | { error: false }
  | { error: true; errorMessage: string }
)


export default function Home() {
  const [formData, setFormData] = useState({
    fullName: '',
    birthYear: '',
    country: '',
  })
  const [result, setResult] = useState<ScreeningResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({length: currentYear - 1899}, (_, i) => 1900 + i)
  
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Australia", "Bangladesh", "Belarus", 
    "Brazil", "Canada", "China", "Colombia", "Cuba", "Egypt", "Ethiopia", "France", "Germany", 
    "India", "Indonesia", "Iran", "Iraq", "Israel", "Italy", "Japan", "Kenya", "Libya", "Mexico", 
    "Nigeria", "North Korea", "Pakistan", "Philippines", "Russia", "Saudi Arabia", "South Africa", 
    "South Korea", "Spain", "Syria", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", 
    "United States", "Venezuela", "Vietnam", "Yemen", "Zimbabwe"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/screen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.')
        }
        throw new Error('Network response was not ok')
      }
      const data: ScreeningResult = await response.json()
      setResult(data)
    } catch (err) {
      setResult({ 
        error: true, 
        errorMessage: err instanceof Error ? err.message : 'An error occurred while fetching the data.', 
        result: 'Clear'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">OFAC Screening</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1">Birth Year</label>
            <input
              type="number"
              id="birthYear"
              name="birthYear"
              value={formData.birthYear}
              onChange={handleChange}
              required
              min="1900"
              max={currentYear}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter birth year"
              list="yearList"
            />
            <datalist id="yearList">
              {years.map(year => (
                <option key={year} value={year} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter or select country"
              list="countryList"
            />
            <datalist id="countryList">
              {countries.map(country => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            {result.error ? (
              <p className="text-red-600 font-semibold text-center">
                {result.errorMessage.includes('Rate limit exceeded') 
                  ? result.errorMessage 
                  : 'An error occurred while fetching the data. Please try again.'}
              </p>
            ) : (
              <>
                <h2 className={`text-xl text-center font-semibold ${result.result === 'Hit' ? 'text-red-600' : 'text-green-600'}`}>
                  Result: {result.result}
                </h2>
                {result.result === 'Hit' && result.matches && (
                  <div className="mt-2 space-y-1 text-center text-gray-900">
                    <p>Name: {result.matches.name ? '✅' : '❌'}</p>
                    <p>Birth Year: {result.matches.birthYear ? '✅' : '❌'}</p>
                    <p>Country: {result.matches.country ? '✅' : '❌'}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}