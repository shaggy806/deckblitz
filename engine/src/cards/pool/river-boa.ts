import { defineCard } from "../define.js";

export default defineCard({
  name: "River Boa",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 1,
  keywords: ["islandwalk"],
  text: "Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
  ],
});
