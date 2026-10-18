import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 18446.

const ENTER_TEXT = "When this Siege enters, it deals 3 damage to any other target and you gain 3 life.";

export default defineCard({
  name: "Invasion of Ulgrotha",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "any-target" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Ulgrotha", "Grandmother Ravi Sengir"],
  transform: true,
});
