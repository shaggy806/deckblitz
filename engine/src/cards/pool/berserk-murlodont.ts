import { defineCard } from "../define.js";

// EDHREC rank 27838.

export default defineCard({
  name: "Berserk Murlodont",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: "Whenever a Beast becomes blocked, it gets +1/+1 until end of turn for each creature blocking it.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "any", filter: { subtype: "Beast" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { blockersOf: "trigger-object" },
        toughness: { blockersOf: "trigger-object" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever a Beast becomes blocked, it gets +1/+1 until end of turn for each creature blocking it.",
    },
  ],
});
