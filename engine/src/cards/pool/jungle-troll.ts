import { defineCard } from "../define.js";

export default defineCard({
  name: "Jungle Troll",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 2,
  toughness: 1,
  text: "{R}: Regenerate this creature.\n{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{R}: Regenerate this creature.",
    },
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
  ],
});
