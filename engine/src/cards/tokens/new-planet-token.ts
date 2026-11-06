import { defineCard } from "../define.js";

// The New Planet token, made by several Star Trek cards.

export default defineCard({
  name: "New Planet Token",
  art: "21d855f7-fd5c-4eb4-b997-a905849806b9",
  colors: [],
  types: ["land"],
  subtypes: ["Planet"],
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
