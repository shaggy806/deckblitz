import { defineCard } from "../define.js";

// EDHREC rank 9625. Fate Reforged.

export default defineCard({
  name: "Dromoka, the Eternal",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever a Dragon you control attacks, bolster 2. (Choose a creature with the least toughness among creatures you control and put two +1/+1 counters on it.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Dragon" } },
      targets: [],
      effect: { kind: "bolster", amount: 2 },
      resolve: null,
      text: "Whenever a Dragon you control attacks, bolster 2.",
    },
  ],
});
