import { gravestorm } from "../helpers.js";
import { defineCard } from "../define.js";

const GRAVESTORM =
  "Gravestorm (When you cast this spell, copy it for each permanent put into a graveyard from the battlefield this turn.)";

export default defineCard({
  name: "Follow the Bodies",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `${GRAVESTORM}\nInvestigate. (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  targets: [],
  effect: { kind: "create-token", token: "Clue Token", count: 1 },
  triggered: [{ ...gravestorm(), text: GRAVESTORM }],
});
