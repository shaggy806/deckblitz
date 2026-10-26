import { defineCard } from "../define.js";

// Urza's Saga. The lands are chosen as the trigger resolves, untargeted, and
// may be anyone's (the ruling).
export default defineCard({
  name: "Great Whale",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 5,
  toughness: 5,
  text: "When this creature enters, untap up to seven lands.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land" },
        upTo: 7,
        then: { kind: "untap", target: 0 },
        prompt: "Untap up to seven lands",
      },
      resolve: null,
      text: "When this creature enters, untap up to seven lands.",
    },
  ],
});
