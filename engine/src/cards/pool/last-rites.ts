import { defineCard } from "../define.js";

// The caster discards first and the hand is revealed after, the order the text gives (rule 608.2c).
// One nonland card for each discarded, not "up to": as many as there are when fewer (rule 609.3).

export default defineCard({
  name: "Last Rites",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Discard any number of cards. Target player reveals their hand, then you choose a nonland card from it for each card discarded this way. That player discards those cards.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 0, anyNumber: true },
      {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["land"] },
        picks: { thisWay: "discarded" },
      },
    ],
  },
});
