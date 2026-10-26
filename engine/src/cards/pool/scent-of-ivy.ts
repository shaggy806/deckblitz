import { defineCard } from "../define.js";

// EDHREC rank 18555.
//
// X is set as it resolves, by the green cards revealed then (its ruling).
const TEXT =
  "Reveal any number of green cards in your hand. Target creature gets +X/+X until end of turn, where X is the number of cards revealed this way.";

export default defineCard({
  name: "Scent of Ivy",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: { cardsInHand: "you" },
        filter: { colors: ["G"] },
        destination: "reveal",
        leftover: "stay",
      },
      {
        kind: "modify-pt",
        target: 0,
        power: { thisWay: "revealed", who: "you" },
        toughness: { thisWay: "revealed", who: "you" },
        duration: "end-of-turn",
      },
    ],
  },
});
