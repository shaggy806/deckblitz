import { defineCard } from "../define.js";

// EDHREC rank 24848. Reap What Is Sown's three slots, then each untapped.
export default defineCard({
  name: "Leo's Guidance",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put a +1/+1 counter on each of up to three target creatures. Untap them.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        together: true,
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 2, counter: "+1/+1", amount: 1 },
        ],
      },
      { kind: "untap", target: 0 },
      { kind: "untap", target: 1 },
      { kind: "untap", target: 2 },
    ],
  },
});
