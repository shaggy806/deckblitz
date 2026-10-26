import { defineCard } from "../define.js";

export default defineCard({
  name: "Giantbaiting",
  manaCost: "{2}{R/G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  conspire: true,
  text: "Create a 4/4 red and green Giant Warrior creature token with haste. Exile it at the beginning of the next end step.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Giant Warrior Token", count: 1, separate: true },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        about: "created",
        effect: { kind: "exile", target: 0 },
        text: "Exile it at the beginning of the next end step.",
      },
    ],
  },
});
