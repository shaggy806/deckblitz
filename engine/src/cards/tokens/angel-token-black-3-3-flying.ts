import { defineCard } from "../define.js";

/** 3/3 black Angel with flying — Haunted Angel's token (no token printing). */
export default defineCard({
  name: "Angel Token (black 3/3 flying)",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying",
});
