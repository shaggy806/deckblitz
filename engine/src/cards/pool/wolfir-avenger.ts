import { defineCard } from "../define.js";

export default defineCard({
  name: "Wolfir Avenger",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\n{1}{G}: Regenerate this creature.",
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
