import { defineCard } from "../define.js";

// EDHREC rank 21994. Two distinct targets (its ruling: not the same creature
// twice); an illegal one by resolution leaves the other's counter.

export default defineCard({
  name: "Travel Preparations",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{1}{W}" },
  text: "Put a +1/+1 counter on each of up to two target creatures.\nFlashback {1}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
