const ITEM_NAME = "twitter-kols-list";

export const saveData = (data) => {
  localStorage.setItem(ITEM_NAME, JSON.stringify(data));
};

export const getData = () => {
  if(typeof window !== "undefined"){
    const data = localStorage.getItem(ITEM_NAME);
    return data ? JSON.parse(data) : [];
  }
  return []
};

export const getAccount = (account) => {
  const accounts = getData();

  return accounts.find((_account) => _account.userId === account);
};

export const addAccount = (account) => {
  console.log(`new account:`)
  console.log(account)
  const accounts = getData();
  console.log(`storage`)
  console.log(accounts)
  // add back ...filteredAccounts to the return array once we are able to do more twitter requests
  const filteredAccounts = accounts.filter(
    (_account) => _account.userId !== account.userId
  );
  return saveData([account]);
};

export const deleteAccount = (account) => {
  const accounts = getData();
  const filteredAccounts = accounts.filter(
    (account) => account.userId === account
  );
  return saveData([...filteredAccounts]);
};
