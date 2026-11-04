import { defineCard } from "../define.js";

const TEXT = "At the beginning of each end step, if this creature regenerated this turn, create a 0/1 blue Starfish creature token for each time it regenerated this turn.";

export default defineCard({
  name: "Spiny Starfish",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Starfish"],
  power: 0,
  toughness: 1,
  text: `{U}: Regenerate this creature.\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{U}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "regenerated", who: "any-player", selfOnly: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "0/1 Blue Starfish Token",
        count: { turnHistory: "regenerated", who: "each-player", selfOnly: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
