import { defineCard } from "../define.js";

// EDHREC rank 29786.

const TEXT =
  "{5}{R}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";

export default defineCard({
  name: "Ill-Tempered Cyclops",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{5}{R}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
