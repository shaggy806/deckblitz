import { defineCard } from "../define.js";

// Tempest Remastered (TPR). EDHREC rank 18198.
//
// Any Sliver, whoever controls it; its blockers are counted as this resolves.
const TEXT =
  "Whenever a Sliver becomes blocked, that Sliver gets +1/+1 until end of turn for each creature blocking it.";

export default defineCard({
  name: "Spined Sliver",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "any", filter: { subtype: "Sliver" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { blockersOf: "trigger-object" },
        toughness: { blockersOf: "trigger-object" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
