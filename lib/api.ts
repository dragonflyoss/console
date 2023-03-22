const API_URL = process.env.NEXT_PUBLIC_API;

async function fetchAPI(param: string, query = '', { variables }: Record<string, any> = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_URL}${param}`, {
    headers,
    method: 'POST',
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error('Failed to fetch API');
  }
  return json.data;
}

export async function getSignin(query: any) {
  const data = await fetchAPI('/users/signin', query);
  return data;
}

export async function getSignup(query: any) {
  const data = await fetchAPI('/users/signup', query);
  return data;
}