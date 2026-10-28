import { defineCard } from "../define.js";

// Alara Reborn (ARB). EDHREC rank 30826. Whether to impose the requirement is
// chosen as the trigger resolves (the ruling).

const ETB = "When this creature enters, you may have target creature block it this turn if able.";

export default defineCard({
  name: "Giant Ambush Beetle",
  manaCost: "{3}{B/G}{R}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature block this creature this turn if able?",
        effect: { kind: "block-if-able", target: 0, attacker: "source" },
      },
      resolve: null,
      text: ETB,
    },
  ],
});
