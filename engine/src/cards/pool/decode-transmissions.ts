import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 9045.
// The void "instead" replaces the whole instruction: read as it resolves.

export default defineCard({
  name: "Decode Transmissions",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "You draw two cards and lose 2 life.\n" +
    "Void — If a nonland permanent left the battlefield this turn or a spell was warped this turn, instead you draw two cards and each opponent loses 2 life.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: VOID_CONDITION,
    then: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 2 },
        { kind: "lose-life", amount: 2, who: "each-opponent" },
      ],
    },
    else: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 2 },
        { kind: "lose-life", amount: 2, who: "you" },
      ],
    },
  },
});
