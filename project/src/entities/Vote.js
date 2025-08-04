import { createEntityClient } from "../utils/entityWrapper";
import schema from "./Vote.json";
export const Vote = createEntityClient("Vote", schema);
