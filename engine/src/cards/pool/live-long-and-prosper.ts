import { defineCard } from "../define.js";

// EDHREC rank 28930.

// "Double your life total" (rule 701.10e): you gain or lose the life that
// makes it twice what it was — the same as its becoming twice that (119.5).
// The draw counts the cards in your hand as it begins.
export default defineCard({
  name: "Live Long and Prosper",
  manaCost: "{5}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "This spell can't be countered.\nDouble your life total. Draw cards equal to the number of cards in your hand. You have no maximum hand size until your next turn.",
  cantBeCountered: true,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "set-life-total", who: "you", amount: { product: [{ lifeTotal: "you" }, 2] } },
      { kind: "draw", amount: { cardsInHand: "you" } },
      { kind: "player-effect", duration: "until-your-next-turn", noMaxHandSize: "you" },
    ],
  },
});
