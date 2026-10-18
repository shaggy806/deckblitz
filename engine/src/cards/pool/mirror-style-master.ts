import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";
import { backup } from "../helpers.js";

// EDHREC rank 12761.
//
// Which creatures is fixed as the ability resolves; each token copies only
// the copiable values (none of the counters or attachments that made the
// original modified — the rulings), enters tapped and attacking whoever its
// controller chooses (rule 508.4), never declared as an attacker, and all of
// them enter at once (`simultaneous`). Exiled by a delayed trigger at end of
// combat. Backup grants the attack trigger to another creature until end of
// turn: there "this creature" is that creature.

const ATTACK_TEXT =
  "Whenever this creature attacks, for each attacking modified creature you control, create a tapped and attacking token that's a copy of that creature. Exile those tokens at end of combat.";

const ATTACK: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      {
        kind: "create-token-copy",
        of: { each: { type: "creature", controlledBy: "you", attacking: true, modified: true } },
        count: 1,
        who: "you",
        tapped: true,
        attacking: "choose",
        exileAtEndOfCombat: true,
      },
    ],
  },
  resolve: null,
  text: ATTACK_TEXT,
};

export default defineCard({
  name: "Mirror-Style Master",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\n${ATTACK_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  triggered: [backup(1, { triggered: [ATTACK] }), ATTACK],
});
