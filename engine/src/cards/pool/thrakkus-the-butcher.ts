import { defineCard } from "../define.js";

// EDHREC rank 2761. "Each Dragon you control" includes Thrakkus (it has no
// "other"): +X/+0 where X is its power as this resolves (the ruling).
export default defineCard({
  name: "Thrakkus the Butcher",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Peasant"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhenever Thrakkus attacks, double the power of each Dragon you control until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "double-pt-all",
        filter: { subtype: "Dragon", controlledBy: "you" },
        duration: "end-of-turn",
        powerOnly: true,
      },
      resolve: null,
      text: "Whenever Thrakkus attacks, double the power of each Dragon you control until end of turn.",
    },
  ],
});
