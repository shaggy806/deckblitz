import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 12101.
// The void card is drawn after the rest, the condition read as it resolves.

export default defineCard({
  name: "Hymn of the Faller",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Surveil 1, then you draw a card and lose 1 life. (To surveil 1, look at the top card of your library. You may put it into your graveyard.)\n" +
    "Void — If a nonland permanent left the battlefield this turn or a spell was warped this turn, draw another card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "surveil", amount: 1 },
      { kind: "draw", amount: 1 },
      { kind: "lose-life", amount: 1, who: "you" },
      { kind: "conditional", condition: VOID_CONDITION, then: { kind: "draw", amount: 1 } },
    ],
  },
});
