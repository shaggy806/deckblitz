import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// Backup 1 grants the attack trigger — the ability printed below it (rule
// 702.165a) — to another creature it targets. The blocking rule is on the
// target creature for the turn (rule 509.1b), not an ability it gains.

const ATTACK_TEXT =
  "Whenever this creature attacks, double the number of +1/+1 counters on target creature. That creature can't be blocked by creatures with power 2 or less this turn.";

const ATTACK: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "double-counters", target: 0, counter: "+1/+1" },
      { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { power: { op: "lte", n: 2 } } },
    ],
  },
  resolve: null,
  text: ATTACK_TEXT,
};

export default defineCard({
  name: "Bright-Palm, Soul Awakener",
  manaCost: "{1}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Shaman"],
  power: 4,
  toughness: 3,
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\n${ATTACK_TEXT}`,
  triggered: [backup(1, { triggered: [ATTACK] }), ATTACK],
});
