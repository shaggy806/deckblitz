import { defineCard } from "../define.js";

const TEXT =
  "{1}, {T}, Discard a card: Create a 1/1 colorless Sliver artifact creature token named Metallic Sliver.";

export default defineCard({
  name: "Sliversmith",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Metallic Sliver Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
