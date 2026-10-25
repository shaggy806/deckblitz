import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 20612.
export default defineCard({
  name: "Chillerpillar",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 3,
  text: "{4}{S}{S}: Monstrosity 2. (If this creature isn't monstrous, put two +1/+1 counters on it and it becomes monstrous. {S} can be paid with one mana from a snow source.)\nAs long as this creature is monstrous, it has flying.",
  activated: [
    {
      cost: { mana: "{4}{S}{S}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 2 },
      resolve: null,
      text: "{4}{S}{S}: Monstrosity 2.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["flying"],
      text: "As long as this creature is monstrous, it has flying.",
    },
  ],
});
