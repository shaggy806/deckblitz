import { gravestorm } from "../helpers.js";
import { defineCard } from "../define.js";

const GRAVESTORM =
  "Gravestorm (When you cast this spell, copy it for each permanent put into a graveyard from the battlefield this turn.)";

export default defineCard({
  name: "Ominous Harvest",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${GRAVESTORM}\nTarget player draws a card and loses 1 life.`,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1, target: 0 },
      { kind: "lose-life", amount: 1, target: 0 },
    ],
  },
  triggered: [{ ...gravestorm(), text: GRAVESTORM }],
});
