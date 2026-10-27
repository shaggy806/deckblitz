import { defineCard } from "../define.js";

// "If you do": the damage needs the tap to have happened this way — so with
// the first target gone, or already tapped, nothing is dealt (the ruling).
export default defineCard({
  name: "Spirit Flare",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap target untapped creature you control. If you do, it deals damage equal to its power to target attacking or blocking creature an opponent controls.\nFlashback—{1}{W}, Pay 3 life. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    { kind: "permanent", whose: "you", filter: { type: "creature", tapped: false } },
    {
      kind: "permanent",
      whose: "opponent",
      filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "tapped" },
        then: { kind: "damage", amount: { powerOf: 0 }, target: 1, from: { target: 0 } },
      },
    ],
  },
  flashback: { cost: "{1}{W}", payLife: 3 },
});
