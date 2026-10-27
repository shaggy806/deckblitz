import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 26995.

export default defineCard({
  name: "Nomad Decoy",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 1,
  toughness: 2,
  text: "{W}, {T}: Tap target creature.\nThreshold — {W}{W}, {T}: Tap two target creatures. Activate only if there are seven or more cards in your graveyard.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{W}, {T}: Tap target creature.",
    },
    {
      cost: { mana: "{W}{W}", tap: true },
      condition: { kind: "threshold" },
      targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
        ],
      },
      resolve: null,
      text: "Threshold — {W}{W}, {T}: Tap two target creatures. Activate only if there are seven or more cards in your graveyard.",
    },
  ],
});
