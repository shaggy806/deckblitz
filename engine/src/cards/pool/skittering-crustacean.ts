import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 19051.
export default defineCard({
  name: "Skittering Crustacean",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab"],
  power: 2,
  toughness: 3,
  text: "{6}{U}: Monstrosity 4. (If this creature isn't monstrous, put four +1/+1 counters on it and it becomes monstrous.)\nAs long as this creature is monstrous, it has hexproof. (It can't be the target of spells or abilities your opponents control.)",
  activated: [
    {
      cost: { mana: "{6}{U}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 4 },
      resolve: null,
      text: "{6}{U}: Monstrosity 4.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["hexproof"],
      text: "As long as this creature is monstrous, it has hexproof.",
    },
  ],
});
