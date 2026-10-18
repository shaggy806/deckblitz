import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 18106. It may target an artifact or creature that's already
// tapped (the ruling); the stun counter still goes on.

const ENTER_TEXT =
  "When this Siege enters, tap target artifact or creature an opponent controls and put a stun counter on it.";

export default defineCard({
  name: "Invasion of Kamigawa",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Kamigawa", "Rooftop Saboteurs"],
  transform: true,
});
