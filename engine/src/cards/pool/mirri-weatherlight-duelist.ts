import { defineCard } from "../define.js";

// Each is read as a declaration is made: tapping Mirri after creatures have
// attacked removes none from combat, and attacks on your planeswalkers aren't
// limited (the rulings). Vigilance aside, she's tapped by attacking, so it holds
// through the opponents' turns until she untaps.
const ATTACK_TEXT = "Whenever Mirri attacks, each opponent can't block with more than one creature this combat.";
const TAPPED_TEXT = "As long as Mirri is tapped, no more than one creature can attack you each combat.";

export default defineCard({
  name: "Mirri, Weatherlight Duelist",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${ATTACK_TEXT}\n${TAPPED_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "limit-blockers", who: "each-opponent", most: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: true } },
      attackLimit: { most: 1, covers: "you" },
      text: TAPPED_TEXT,
    },
  ],
});
