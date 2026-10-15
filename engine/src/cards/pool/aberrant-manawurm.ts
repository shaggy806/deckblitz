import { defineCard } from "../define.js";

// EDHREC rank 23205. X is the mana actually spent on the spell (`manaSpentOf`
// the trigger object — 0 for a free cast), read even once the spell has left
// the stack: the trigger resolves before it, countered or not (the ruling).
const CAST_TEXT =
  "Whenever you cast an instant or sorcery spell, this creature gets +X/+0 until end of turn, where X is the amount of mana spent to cast that spell.";

export default defineCard({
  name: "Aberrant Manawurm",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 2,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { manaSpentOf: "trigger-object" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
