import { defineCard } from "../define.js";

// EDHREC rank 25562.
//
// The blue cards are revealed as it resolves (its ruling); revealing none
// asks the spell's controller for {0}.
const TEXT =
  "Reveal any number of blue cards in your hand. Counter target spell unless its controller pays {1} for each card revealed this way.";

export default defineCard({
  name: "Scent of Brine",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: { cardsInHand: "you" },
        filter: { colors: ["U"] },
        destination: "reveal",
        leftover: "stay",
      },
      {
        kind: "unless",
        chooser: 0,
        options: [{ payGeneric: { thisWay: "revealed", who: "you" }, text: "Pay {1} for each card revealed" }],
        otherwise: { kind: "counter", target: 0 },
      },
    ],
  },
});
