import { defineCard } from "../define.js";

const STATIC_TEXT = "Attacking creatures you control have double strike.";

export default defineCard({
  name: "Raphael, the Nightwatcher",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 2,
  toughness: 3,
  sneak: { cost: "{1}{R}{R}" },
  text:
    "Sneak {1}{R}{R} (You may cast this spell for {1}{R}{R} if you also return an unblocked attacker you control to hand during the declare blockers step. He enters tapped and attacking.)\n" +
    STATIC_TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantKeywords: ["double-strike"],
      text: STATIC_TEXT,
    },
  ],
});
