import { defineCard } from "../define.js";

export default defineCard({
  name: "Ranger en-Vec",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Archer", "Ranger"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\n{G}: Regenerate this creature.",
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
