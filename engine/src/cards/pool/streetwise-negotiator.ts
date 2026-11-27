import { defineCard, type StaticAbility } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 24920.
//
// Backup grants the static printed below it until end of turn, fixed as it
// triggers (rule 702.165d); on another creature "this creature" is that one.

const DAMAGE_TEXT = "This creature assigns combat damage equal to its toughness rather than its power.";

const DAMAGE: StaticAbility = {
  affects: { scope: "self" },
  combatDamageByToughness: "always",
  text: DAMAGE_TEXT,
};

export default defineCard({
  name: "Streetwise Negotiator",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Citizen"],
  power: 0,
  toughness: 2,
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\n${DAMAGE_TEXT}`,
  triggered: [backup(1, { static: [DAMAGE] })],
  static: [DAMAGE],
});
