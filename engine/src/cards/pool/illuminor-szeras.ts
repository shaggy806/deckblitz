import { defineCard } from "../define.js";

export default defineCard({
  name: "Illuminor Szeras",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 3,
  toughness: 3,
  text: "Secrets of the Soul — {T}, Sacrifice another creature: Add an amount of {B} equal to the sacrificed creature's mana value.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: { manaValueOf: "sacrificed" } },
      resolve: null,
      text: "Secrets of the Soul — {T}, Sacrifice another creature: Add an amount of {B} equal to the sacrificed creature's mana value.",
      otherOnly: true,
    },
  ],
});
