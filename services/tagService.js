import { ID, Query } from "react-native-appwrite";
import databaseService from "./databaseService";

const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colTagsId = process.env.EXPO_PUBLIC_APPWRITE_COL_TAGS_ID;

const tagService = {
  async getTags(userId) {
    try {
      const response = await databaseService.listDocuments(dbId, colTagsId, [
        Query.equal("user_id", userId),
      ]);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  },

  async addTag(userId, name) {
    try {
      const response = await databaseService.createDocument(
        dbId,
        colTagsId,
        {
          name,
          user_id: userId,
        },
        ID.unique()
      );
      return { data: response, error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
};

export default tagService;