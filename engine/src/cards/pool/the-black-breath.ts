import { defineCard } from "../define.js";

export default defineCard({
  name: "The Black Breath",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Creatures your opponents control get -1/-1 until end of turn. The Ring tempts you.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      { kind: "the-ring-tempts-you" },
    ],
  },
});
