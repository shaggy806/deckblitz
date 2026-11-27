import { defineCard, type StaticAbility } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 25170.
//
// Backup grants the static printed below it until end of turn, fixed as it
// triggers (rule 702.165d); on another creature "this creature" is that one.

const EVASION_TEXT = "This creature can't be blocked by creatures with power 2 or less.";

const EVASION: StaticAbility = {
  affects: { scope: "self" },
  restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "lte", n: 2 } } }],
  text: EVASION_TEXT,
};

export default defineCard({
  name: "Chomping Kavu",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 3,
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\n${EVASION_TEXT}`,
  triggered: [backup(1, { static: [EVASION] })],
  static: [EVASION],
});
