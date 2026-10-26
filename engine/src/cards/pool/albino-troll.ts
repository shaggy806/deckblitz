import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 30400.

export default defineCard({
  name: "Albino Troll",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 3,
  toughness: 3,
  text: "Echo {1}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\n{1}{G}: Regenerate this creature.",
  triggered: [
    echo("{1}{G}"),
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{G}: Regenerate this creature.",
    },
  ],
});
