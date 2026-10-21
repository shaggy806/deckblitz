import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, you may have the base power and toughness of target Human you control become equal to this creature's power and toughness until end of turn.";

export default defineCard({
  name: "Exuberant Wolfbear",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Bear"],
  power: 4,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Human" } }],
      // Chosen as it resolves; its actual power and toughness then (last
      // known if it has left — its rulings).
      effect: {
        kind: "may",
        prompt: "Have the Human's base power and toughness become equal to this creature's power and toughness?",
        effect: {
          kind: "animate",
          target: 0,
          power: { powerOf: "source" },
          toughness: { toughnessOf: "source" },
          addTypes: [],
          addSubtypes: [],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
