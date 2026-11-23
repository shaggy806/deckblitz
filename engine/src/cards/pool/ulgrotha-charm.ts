import { defineCard } from "../define.js";

// Playtest card. Each mode is the card it names, as that card's Oracle text
// reads (the parenthetical is its reminder): Merchant Scroll, Memory Lapse
// and Forget, each authored as in the pool.

const SCROLL = "Merchant Scroll (Search for a blue instant.)";
const LAPSE = "Memory Lapse (Counter a spell and put it on top of its owner's library.)";
const FORGET = "Forget (Target player discards 2, then draws that many.)";

export default defineCard({
  name: "Ulgrotha Charm",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${SCROLL}\n• ${LAPSE}\n• ${FORGET}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: SCROLL,
        targets: [],
        effect: {
          kind: "search-library",
          filter: { type: "instant", colors: ["U"] },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      {
        text: LAPSE,
        targets: ["spell"],
        effect: { kind: "counter", target: 0, into: "library-top" },
      },
      {
        text: FORGET,
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: 0, amount: 2 },
            { kind: "draw", target: 0, amount: { thisWay: "discarded" } },
          ],
        },
      },
    ],
  },
});
