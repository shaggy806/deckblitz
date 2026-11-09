import { defineCard } from "../define.js";

export default defineCard({
  name: "Veilstone Amulet",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Whenever you cast a spell, creatures you control can't be the targets of spells or abilities your opponents control this turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "prohibit", prohibits: [{ act: "be-targeted", object: { type: "creature", controlledBy: "you" }, by: "opponents" }] },
      resolve: null,
      text: "Whenever you cast a spell, creatures you control can't be the targets of spells or abilities your opponents control this turn.",
    },
  ],
});
