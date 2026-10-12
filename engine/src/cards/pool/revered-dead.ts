import { defineCard } from "../define.js";

export default defineCard({
  name: "Revered Dead",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{W}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{W}: Regenerate this creature.",
    },
  ],
});
