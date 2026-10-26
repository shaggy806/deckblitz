import { defineCard } from "../define.js";

// One target gone by resolution still taps the other (the ruling).
export default defineCard({
  name: "Feeling of Dread",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  flashback: { cost: "{1}{U}" },
  text: "Tap up to two target creatures.\nFlashback {1}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
    ],
  },
});
