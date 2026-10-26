import { defineCard } from "../define.js";

// A 1/1 green Insect creature token with flying *named* Butterfly (Giant
// Caterpillar) — keyed " Token", named by `tokenName`.

export default defineCard({
  name: "Butterfly Token",
  tokenName: "Butterfly",
  art: "d7636957-f183-4f58-87a6-056cde657114",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
