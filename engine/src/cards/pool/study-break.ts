import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 25203.

export default defineCard({
  name: "Study Break",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap up to two target creatures.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [{ kind: "tap", target: 0 }, { kind: "tap", target: 1 }, learn()],
  },
});
