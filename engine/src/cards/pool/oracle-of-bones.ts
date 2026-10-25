import { defineCard } from "../define.js";

// EDHREC rank 18339.

export default defineCard({
  name: "Oracle of Bones",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  tribute: 2,
  text: "Haste\nTribute 2 (As this creature enters, an opponent of your choice may put two +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, you may cast an instant or sorcery spell from your hand without paying its mana cost.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "cast-now", from: "hand", free: true, spell: { typesAnyOf: ["instant", "sorcery"] } },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, you may cast an instant or sorcery spell from your hand without paying its mana cost.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
