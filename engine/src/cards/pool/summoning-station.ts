import { defineCard } from "../define.js";

// EDHREC rank 12334.

export default defineCard({
  name: "Summoning Station",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Create a 2/2 colorless Pincher creature token.\nWhenever an artifact is put into a graveyard from the battlefield, you may untap this artifact.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Pincher Token", count: 1 },
      resolve: null,
      text: "{T}: Create a 2/2 colorless Pincher creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Summoning Station?",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: "Whenever an artifact is put into a graveyard from the battlefield, you may untap this artifact.",
    },
  ],
});
