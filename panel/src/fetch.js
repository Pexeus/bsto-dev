//sets the headers and options for POST requests
export async function post(route, body) {
    const key = getKey()

    let fetchOptions = {
        headers: {
            "Content-Type": "application/json",
            "Auth": key
        },
        method: "POST",
        body: JSON.stringify(body)
    }

    const response = await fetch(route, fetchOptions)
    const jsonData = await response.json()

    return jsonData
}
//sets the headers and options for GET requests
export async function get(route) {
    const key = getKey()

    let fetchOptions = {
        headers: {
            "Content-Type": "application/json",
            "Auth": key
        },
        method: "GET",
    }

    const response = await fetch(route, fetchOptions)
    const jsonData = await response.json()

    return jsonData
}

function getKey() {
    if (localStorage.jwt != undefined) {
        const jwt = localStorage.jwt
        const token = decodeToken(jwt)


        return token.key
    }
    else {
        return false
    }
}

function decodeToken(token) {
    let payload = token.replace(/-/g, '+').replace(/_/g, '/').split('.')[1]
    payload = JSON.parse(Buffer.from(payload, 'base64').toString())
    return payload
}