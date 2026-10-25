import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 31749.

const PT_TEXT = "This creature gets +1/+1 as long as you control a Mountain.";
const PING_TEXT = "{4}{R}: This creature deals 2 damage to any target.";

export default defineCard({
  name: "Nightfire Giant",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 4,
  toughness: 3,
  text: `${PT_TEXT}\n${PING_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 1 },
      grantPt: [1, 1],
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{R}", tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
