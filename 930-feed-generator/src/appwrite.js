import {
  Client,
  Account,
  Users,
  ID,
  AppwriteException,
  Avatars,
  Databases,
  Graphql,
  Locale,
  Storage,
  Query,
} from "node-appwrite";
import "dotenv";

const APPWRITE_API_KEY =
  "standard_4f83618e471fb4530f1faedbec2f20a8a03f3e5c87b425a8b2d4062b9a432e57ee942ae1867aa844b698d4762b2cd3d7dcac3a75d8f83bd4cc5fad8eceb254fb24a58de35e66d4a2773bed428b7ef1f0ad52c40f63b03f852affd8748c2345bb47809a2687773e915bc18325a3f8e6ad07e42d794d3683752e84ce3811bbac2b";
export const APPWRITE_ENDPOINT_URL = "http://localhost/v1";
export const APPWRITE_PROJECT = "66d08cfe0003ee9032c3";
export const APPWRITE_BUCKET = "66d09183002c4b74e02a";
export const APPWRITE_DATABASE = "64cad48318560a5d74a5";
export const APPWRITE_COMMENTS_COLLECTION = "66018bf685bfabdd2dc0";
export const APPWRITE_CHATS_COLLECTION = "65f1a197ea543141a6b0";
export const APPWRITE_FOLLOWS_COLLECTION = "659801bdac67fff88cf7";
export const APPWRITE_POSTS_COLLECTION = "651d0a22d8b7244ed9ea";
export const APPWRITE_PROFILE_COLLECTION = "65960abc947aa16f59b8";
export const APPWRITE_ROOMS_COLLECTION = "65f164027665eab07c31";
export const APPWRITE_LIKES_COLLECTION = "67078ac2000c7d25ac33";
export const APPWRITE_STATUS_PUBLICITY_COLLECTION = "67e05516001410aef0ae";

export function createAdminClient() {
  const adminClient = new Client()
    .setEndpoint(APPWRITE_ENDPOINT_URL)
    .setProject(APPWRITE_PROJECT)
    .setKey(APPWRITE_API_KEY)
    .setSelfSigned(); // Use only on dev mode with a self-signed SSL cert

  return {
    get account() {
      return new Account(adminClient);
    },
    get users() {
      return new Users(adminClient);
    },
    get storage() {
      return new Storage(adminClient);
    },
    get database() {
      return new Databases(adminClient);
    },
    get avatar() {
      return new Avatars(adminClient);
    },
    get locale() {
      return new Locale(adminClient);
    },
    get graphql() {
      return new Graphql(adminClient);
    },
  };
}

export async function createUser() {
  const { users } = createAdminClient();

  let promise = users.create(
    ID.unique(),
    "email@example.com",
    undefined,
    "password",
    "Jane Doe"
  );

  promise.then(
    function (response) {
      console.log(response);
    },
    function (error) {
      console.log(error);
    }
  );
}

export async function getUsers() {
  const { users } = createAdminClient();

  const result = await users
    .list
    // [], // queries (optional)
    // '<SEARCH>' // search (optional)
    ();

  console.log(result);
}

export const getUser = async (user_id) => {
  try {
    const { users } = createAdminClient();
    return users.get(user_id);
  } catch (error) {
    if (error instanceof AppwriteException) {
      const appwriteError = error;
      throw new Error(appwriteError.message);
    }
  }
};

export const getCurrentUser = async () => {
  try {
    const { account } = createAdminClient();
    return account.get();
  } catch (error) {
    if (error instanceof AppwriteException) {
      const appwriteError = error;
      throw new Error(appwriteError.message);
    }
  }
};

export const getPosts = async () => {
  const res = await fetch("https://dummyjson.com/posts");
  const { posts } = await res.json();
  return posts;
};

export const signInWithEmail = async (email, password) => {
  try {
    const { account } = createAdminClient();
    return account.createEmailPasswordSession(email, password);
  } catch (error) {
    if (error instanceof AppwriteException) {
      const appwriteError = error;
      throw new Error(appwriteError.message);
    }
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const { account } = createAdminClient();
    return account.create("unique()", email, password);
  } catch (error) {
    if (error instanceof AppwriteException) {
      const appwriteError = error;
      throw new Error(appwriteError.message);
    }
  }
};

export const signOut = async () => {
  try {
    const { account } = createAdminClient();
    return account.deleteSession("current");
  } catch (error) {
    if (error instanceof AppwriteException) {
      const appwriteError = error;
      throw new Error(appwriteError.message);
    }
  }
};

export async function checkAndRenewToken() {
  const { account } = createAdminClient();
  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    // No token found, user needs to log in
    return;
  }

  // Decode the JWT to check its expiration
  const decodedToken = JSON.parse(atob(jwt.split(".")[1]));
  const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();

  if (expirationTime - currentTime < 300000) {
    // 5 minutes before expiration
    // Token is about to expire, renew it
    account
      .createJWT()
      .then((response) => {
        localStorage.setItem("jwt", response.jwt);
        account.client.setJWT(response.jwt);
      })
      .catch((error) => {
        console.error("Token renewal failed", error);
        // Handle the error (e.g., redirect to login page)
      });
  }
}

export async function getSession(sessionId) {
  const { account } = createAdminClient();
  let session = account.getSession(sessionId);
  return session;
}
