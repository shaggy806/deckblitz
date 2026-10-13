import { defineCard } from "../define.js";

// Svella, Ice Shaper's token, *named* Icy Manalith. "Icy Manalith" is
// already a real card (Coldsnap, {3}), whose mana cost a token mustn't have,
// so it's keyed " Token" and named by `tokenName` (Ajani's Pridemate Token).

export default defineCard({
  name: "Icy Manalith Token",
  tokenName: "Icy Manalith",
  art: "3db39e3b-fad4-4c9b-911f-69883ac7e0e1",
  colors: [],
  supertypes: ["snow"],
  types: ["artifact"],
  text: "{T}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
});
