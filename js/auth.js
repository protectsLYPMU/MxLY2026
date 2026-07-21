async function login(username, password) {

  const result = await api("login", {
    username,
    password
  });

  if (!result.success) {
    return result;
  }

  localStorage.setItem(
    "sessionToken",
    result.data.sessionToken
  );

  localStorage.setItem(
    "user",
    JSON.stringify(result.data.user)
  );

  return result;

}
