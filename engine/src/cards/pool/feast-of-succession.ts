import { defineCard } from "../define.js";

export default defineCard({
  name: "Feast of Succession",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -4/-4 until end of turn. You become the monarch.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -4,
        toughness: -4,
        duration: "end-of-turn",
      },
      { kind: "become-monarch" },
    ],
  },
});
