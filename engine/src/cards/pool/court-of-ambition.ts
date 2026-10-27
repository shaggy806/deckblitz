import { defineCard } from "../define.js";

// EDHREC rank 2545.
//
// Polygraph Orb's punisher: each opponent chooses in turn order from the next
// one, a chosen discard held hidden in hand until every opponent has chosen,
// then the discards happen at once and each who couldn't or didn't loses the
// life (rule 101.4 — the last ruling below). Whether you're the monarch is
// read as the trigger resolves.
//
// Rulings:
//   [2020-11-10] As Court of Ambition's second ability resolves, first the next opponent in turn
//     order chooses whether they are discarding or not. If they are, they choose a card without
//     revealing it (or two cards without revealing them, if you're the monarch), then each other
//     opponent in turn order does the same. Then each chosen card is discarded simultaneously, and
//     finally each player who couldn't or didn't discard loses the appropriate amount of life.

const ENTERS_TEXT = "When this enchantment enters, you become the monarch.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, each opponent loses 3 life unless they discard a card. If you're the monarch, instead each opponent loses 6 life unless they discard two cards.";

export default defineCard({
  name: "Court of Ambition",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "monarch", who: "you" },
        then: {
          kind: "each-player-may",
          who: "each-opponent",
          options: [{ discard: 2, text: "Discard two cards" }],
          ifDidnt: { kind: "lose-life", amount: 6, who: "that-player" },
        },
        else: {
          kind: "each-player-may",
          who: "each-opponent",
          options: [{ discard: 1, text: "Discard a card" }],
          ifDidnt: { kind: "lose-life", amount: 3, who: "that-player" },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
