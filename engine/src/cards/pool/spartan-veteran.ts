import { defineCard } from "../define.js";

export default defineCard({
  name: "Spartan Veteran",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "During your turn, this creature has first strike. (It deals combat damage before creatures without first strike.)\n{2}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature has first strike.",
    },
  ],
});
