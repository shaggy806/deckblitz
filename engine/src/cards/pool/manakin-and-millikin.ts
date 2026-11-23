import { defineCard } from "../define.js";

export default defineCard({
  name: "Manakin and Millikin",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 2,
  text: "{T}, Mill a card: Add {C}{C}.",
  activated: [
    {
      cost: { mana: null, tap: true, do: { kind: "mill", target: "you", amount: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 2 },
      resolve: null,
      text: "{T}, Mill a card: Add {C}{C}.",
    },
  ],
});
