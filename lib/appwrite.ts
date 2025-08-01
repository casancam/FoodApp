import { Category, CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appWriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  platform: "com.casancam.appFood",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  bucketId: "688a8cad0034cc3d6c43",
  databaseId: "688a2a2f001fd5fc0853",
  userCollectionId: "688a2a5000236baaf12d",
  categoriesCollectionId: "688a8449001559a97db1",
  menuCollectionId: "688a88c0002c9da767e6",
  customizationsCollectionId: "688a89a6001b96e558a3",
  menuCustomizationsCollectionId: "688a8b7b001f8d6e58ca",
};

export const client = new Client();

client
  .setEndpoint(appWriteConfig.endpoint!)
  .setProject(appWriteConfig.projectId!)
  .setPlatform(appWriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);
export const storage = new Storage(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      ID.unique(),
      { accountId: newAccount.$id, email, name, avatar: avatarUrl }
    ); // the user
  } catch (error) {
    throw new Error(error as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];
    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menu = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.menuCollectionId,
      queries
    );

    if (!menu) throw Error;

    return menu.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCategories = async () => {
  try {
      const categories = await databases.listDocuments(
          appWriteConfig.databaseId,
          appWriteConfig.categoriesCollectionId,
      )
      return categories.documents as unknown as Category[];
  } catch (e) {
      throw new Error(e as string);
  }
}
