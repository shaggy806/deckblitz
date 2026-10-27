import { defineCard } from "../define.js";

// EDHREC rank 29604. Scent of Ivy's shape, negated: the
// black cards are revealed, and X set, as it resolves (its ruling).

const TEXT =
  "Reveal any number of black cards in your hand. Target creature gets -X/-X until end of turn, where X is the number of cards revealed this way.";
const MINUS_X = { product: [{ thisWay: "revealed", who: "you" }, -1] } as const;

export default defineCard({
  name: "Scent of Nightshade",
  manaCost: "{1}{B}",
  colors: ["B"],
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
        filter: { colors: ["B"] },
        destination: "reveal",
        leftover: "stay",
      },
      { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
    ],
  },
});
