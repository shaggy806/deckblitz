import { defineCard } from "../define.js";

// Makes Jace → use "Jace Token".

export default defineCard({
  name: "Vraska's Final Mercy",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• You lose 2 life. Destroy target creature or planeswalker.\n• You lose 2 life. Empower Jace 6. (Put six loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "You lose 2 life. Destroy target creature or planeswalker.",
        targets: [
          {
            kind: "permanent",
            whose: "any",
            filter: { typesAnyOf: ["creature", "planeswalker"] },
          },
        ],
        effect: {
          kind: "sequence",
          effects: [{ kind: "lose-life", amount: 2 }, { kind: "destroy", target: 0 }],
        },
      },
      {
        text: "You lose 2 life. Empower Jace 6.",
        effect: {
          kind: "sequence",
          effects: [{ kind: "lose-life", amount: 2 }, { kind: "empower-jace", amount: 6 }],
        },
      },
    ],
  },
});
