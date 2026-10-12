import { defineCard } from "../define.js";

export default defineCard({
  name: "Trestle Troll",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 1,
  toughness: 4,
  keywords: ["defender", "reach"],
  text: "Defender\nReach (This creature can block creatures with flying.)\n{1}{B}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{B}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}{G}: Regenerate this creature.",
    },
  ],
});
