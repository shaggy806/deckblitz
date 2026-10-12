import { defineCard } from "../define.js";

export default defineCard({
  name: "Shao Jun",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 3,
  text: "Leap Strike — During your turn, Shao Jun has flying and first strike.\nRope Dart — Tap two untapped artifacts you control: Shao Jun deals 1 damage to each opponent.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "artifact", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Rope Dart — Tap two untapped artifacts you control: Shao Jun deals 1 damage to each opponent.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["flying", "first-strike"],
      text: "Leap Strike — During your turn, Shao Jun has flying and first strike.",
    },
  ],
});
