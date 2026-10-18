import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 21738.
//
// Backup grants only the ability printed below it, fixed as it triggers; on
// Bola Slinger itself it's just the counter (the rulings).

const ATTACK_TEXT = "Whenever this creature attacks, tap target artifact or creature an opponent controls.";

const ATTACK: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: { kind: "tap", target: 0 },
  resolve: null,
  text: ATTACK_TEXT,
};

export default defineCard({
  name: "Bola Slinger",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 2,
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\n${ATTACK_TEXT}`,
  triggered: [backup(1, { triggered: [ATTACK] }), ATTACK],
});
