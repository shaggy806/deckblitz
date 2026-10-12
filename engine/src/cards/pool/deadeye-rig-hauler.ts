import { defineCard } from "../define.js";

export default defineCard({
  name: "Deadeye Rig-Hauler",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 2,
  text: "Raid — When this creature enters, if you attacked this turn, you may return target creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Return target creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, you may return target creature to its owner's hand.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
