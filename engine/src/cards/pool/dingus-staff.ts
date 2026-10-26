import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 11662.
//
// "That creature's controller" is the dying creature's controller as it last
// existed on the battlefield (rule 603.10a) — Gimli, Counter of Kills' shape.

const TEXT = "Whenever a creature dies, this artifact deals 2 damage to that creature's controller.";

export default defineCard({
  name: "Dingus Staff",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
