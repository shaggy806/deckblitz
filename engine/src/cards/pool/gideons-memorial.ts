import { defineCard } from "../define.js";

export default defineCard({
  name: "Gideon's Memorial",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "Creature tokens you control get +1/+0 and have vigilance.\n{T}: Add one mana of any color. Spend this mana only to cast a planeswalker spell.\n{1}{W}, Discard this card: It deals 4 damage to target attacking or blocking creature.",
  static: [
    {
      affects: { scope: "creatures-you-control", tokenOnly: true },
      grantPt: [1, 0],
      grantKeywords: ["vigilance"],
      text: "Creature tokens you control get +1/+0 and have vigilance.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { type: "planeswalker" },
          text: "Spend this mana only to cast a planeswalker spell.",
        },
      },
      resolve: null,
      text: "{T}: Add one mana of any color. Spend this mana only to cast a planeswalker spell.",
    },
    {
      // Eiganjo's channel shape: activated from the hand, discarding the card.
      cost: { mana: "{1}{W}", tap: false },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      zone: "hand",
      text: "{1}{W}, Discard this card: It deals 4 damage to target attacking or blocking creature.",
    },
  ],
});
