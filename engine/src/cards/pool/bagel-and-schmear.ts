import { defineCard } from "../define.js";

const SHARE_TEXT =
  "Share — {W}, {T}, Sacrifice this artifact: Put a +1/+1 counter on up to one target creature. Draw a card. Activate only as a sorcery.";
const NOSH_TEXT = "Nosh — {2}, {T}, Sacrifice this artifact: You gain 3 life and draw a card.";

export default defineCard({
  name: "Bagel and Schmear",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  text: `${SHARE_TEXT}\n${NOSH_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: true, sacrifice: "self" },
      // With no target chosen it only draws; a chosen target that's gone
      // illegal stops the whole ability, the draw too (the rulings, rule
      // 608.2b).
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: SHARE_TEXT,
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: NOSH_TEXT,
    },
  ],
});
