import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever this creature attacks, target creature gets +1/+0 until end of turn.";
const BLITZ_TEXT =
  'Blitz {1}{R} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Mayhem Patrol",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil", "Warrior"],
  power: 1,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ATTACK_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{1}{R}" },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
