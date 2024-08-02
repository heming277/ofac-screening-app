import { NextResponse } from 'next/server'


export async function POST(request: Request) {
  const { fullName, birthYear, country } = await request.json()

  const apiKey = process.env.OFAC_API_KEY

  try {
    const response = await fetch('https://api.ofac-api.com/v4/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
        sources: ["SDN"],
        types: ["person"],
        cases: [
          {
            name: fullName,
            address: {
              country: country
            },
            identification: [
              {
                type: "DOB",
                idNumber: birthYear
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('OFAC API response was not ok')
    }

    const data = await response.json()

    console.log('API Response:', JSON.stringify(data, null, 2))

    if (data.error) {
      throw new Error(data.errorMessage || 'Unknown error occurred')
    }

    let matches = {
      name: false,
      birthYear: false,
      country: false
    }

    if (data.results && data.results[0] && data.results[0].matches) {
      for (const match of data.results[0].matches) {
        const nameMatch = 
          match.name.toLowerCase() === fullName.toLowerCase() ||
          match.nameFormatted.toLowerCase() === fullName.toLowerCase() ||
          match.alias?.some((alias: any) => alias.name.toLowerCase() === fullName.toLowerCase())

        const birthYearMatch = match.personDetails?.birthDates?.some((date: string) => date.includes(birthYear)) || false
        
        const countryMatch = 
          match.addresses?.some((address: any) => address.country.toLowerCase() === country.toLowerCase()) ||
          match.identifications?.some((id: any) => id.country?.toLowerCase() === country.toLowerCase()) ||
          match.personDetails?.citizenships?.some((citizenship: string) => citizenship.toLowerCase() === country.toLowerCase()) ||
          match.personDetails?.nationalities?.some((nationality: string) => nationality.toLowerCase() === country.toLowerCase()) ||
          false

        if (nameMatch) matches.name = true
        if (birthYearMatch) matches.birthYear = true
        if (countryMatch) matches.country = true

        if (matches.name && matches.birthYear && matches.country) break
      }
    }

    const result = matches.name || matches.birthYear || matches.country ? 'Hit' : 'Clear'

    console.log('Matches:', matches)
    console.log('Result:', result)



    return NextResponse.json({ error: false, result, matches })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ 
      error: true, 
      errorMessage: 'An error occurred while searching',
      result: 'Clear', 
      matches: { name: false, birthYear: false, country: false }
    })
  }
}