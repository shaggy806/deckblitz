import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";
import { backup } from "../helpers.js";

// EDHREC rank 7688.
//
// Three separate backup 1 abilities, each granting trample and the
// combat-damage trigger printed below them. A creature targeted by more than
// one gets the trigger more than once, each instance triggering separately
// (the rulings).

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, put that many +1/+1 counters on it.";

const DAMAGE: TriggeredAbility = {
  trigger: { on: "deals-combat-damage-to-player", who: "self" },
  targets: [],
  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
  resolve: null,
  text: DAMAGE_TEXT,
};

const GRANTS = { keywords: ["trample"], triggered: [DAMAGE] } as const;

export default defineCard({
  name: "Conclave Sledge-Captain",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Backup 1, backup 1, backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following abilities until end of turn. Each backup ability triggers separately.)\nTrample\n${DAMAGE_TEXT}`,
  triggered: [backup(1, GRANTS), backup(1, GRANTS), backup(1, GRANTS), DAMAGE],
});
