import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 17922.
//
// "It deals 3 damage": the sacrificed land is the source, by last-known information.
const SAC_TEXT =
  "{1}{B}{R}{R}, {T}, Sacrifice this land: It deals 3 damage to target player. That player discards a card. Activate only as a sorcery.";

export default defineCard({
  name: "Immersturm Skullcairn",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {B}.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{1}{B}{R}{R}", tap: true, sacrifice: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "discard", target: 0, amount: 1 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
