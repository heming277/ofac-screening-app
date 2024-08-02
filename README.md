# OFAC Screening Application

A simple app to screen people against the OFAC Specially Designated Nationals (SDN) list.

## Access the App

The app is deployed to Vercel and can be accessed at [https://ofac-screening-app-seven.vercel.app](https://ofac-screening-app-seven.vercel.app).

## Local Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Create a `.env.local` file
   - Add your OFAC API key: `OFAC_API_KEY=your_api_key_here`
4. Run the development server: `npm run dev`

## Local Usage

Navigate to `http://localhost:3000` and use the form to screen people.

## Production Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm start`


## License

This project is licensed under the MIT License