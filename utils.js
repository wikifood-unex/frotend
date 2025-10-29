const API_BASE_URL = 'https://wikifood.gustavoanjos.com/api';

async function makeRequest(endpoint, data = {}, token = null, method = "GET") {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const config = { method, headers };
    if (method !== "GET" && method !== "HEAD") {
        config.body = JSON.stringify(data);
    }
    
    try {
        const res = await fetch(API_BASE_URL + endpoint, config);
        const contentType = res.headers.get("content-type");
        
        let resultado;
        if (contentType && contentType.includes("application/json")) {
            resultado = await res.json();
        } else {
            resultado = await res.text();
        }
        
        return { ok: res.ok, status: res.status, payload: resultado };
    } catch (error) {
        console.error("Erro na requisição:", error);
        return { ok: false, status: 0, payload: error.message };
    }
}
