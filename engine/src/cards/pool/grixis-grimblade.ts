import { defineCard } from "../define.js";

export default defineCard({
  name: "Grixis Grimblade",
  manaCost: "{U/R}{B}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 2,
  toughness: 1,
  text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has deathtouch. (Any amount of damage it deals to a creature is enough to destroy that creature.)",
  static: [
    {
      // A static's `controls` condition leaves its own permanent out: "another".
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { multicolored: true }, atLeast: 1 },
      grantPt: [1, 1],
      grantKeywords: ["deathtouch"],
      text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has deathtouch.",
    },
  ],
});
