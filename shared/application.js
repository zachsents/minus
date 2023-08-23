
export const BASE_URL = process.env.NODE_ENV === "production" ?
    "https://minuscode.app" :
    "http://localhost:3000"

export const FUNCTIONS_URL = process.env.NODE_ENV === "production" ?
    functionName => `https://us-central1-minus-393905.cloudfunctions.net/${functionName}` :
    functionName => `http://localhost:5001/minus-393905/us-central1/${functionName}`
