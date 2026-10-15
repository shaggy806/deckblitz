import { defineCard } from "../define.js";

// EDHREC rank 15474.
//
// "During your turn" is part of the trigger condition (rule 603.1 —
// `whileCondition`), asked as the sacrifice happens; a sacrifice on another
// player's turn doesn't use up the once each turn (rule 603.2).
const CLUE_TEXT =
  "When this enchantment enters, create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const ALLY_TEXT =
  "Whenever you sacrifice a permanent during your turn, create a 1/1 white Ally creature token. This ability triggers only once each turn.";

export default defineCard({
  name: "Tolls of War",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `${CLUE_TEXT}\n${ALLY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "When this enchantment enters, create a Clue token.",
    },
    {
      trigger: { on: "sacrifice", who: "you" },
      whileCondition: { kind: "your-turn" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 1 },
      resolve: null,
      text: ALLY_TEXT,
    },
  ],
});
