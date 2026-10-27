import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 26078. Counts every Cleric on the battlefield,
// any player's, itself included.

export default defineCard({
  name: "Vile Deacon",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, it gets +X/+X until end of turn, where X is the number of Clerics on the battlefield.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { subtype: "Cleric" } },
        toughness: { countOf: { subtype: "Cleric" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature attacks, it gets +X/+X until end of turn, where X is the number of Clerics on the battlefield.",
    },
  ],
});
