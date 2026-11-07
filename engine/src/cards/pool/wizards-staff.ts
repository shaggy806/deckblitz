import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 2832.
//
// Rulings:
//   [2026-06-29] Triggered abilities use the word "when," "whenever," or "at." They're often
//     written as "[Trigger condition], [effect]." Some keyword abilities are triggered abilities
//     and will have "when," "whenever," or "at the beginning of" in their reminder text.
//   [2026-06-29] If a triggered ability is linked to a second ability, additional instances of
//     that triggered ability are also linked to that second ability. If the second ability refers
//     to "the exiled card," it refers to all cards exiled by instances of the triggered ability.
//   [2026-06-29] In some cases involving linked abilities, an ability requires information about
//     "the exiled card." When this happens, the ability gets multiple answers. If these answers
//     are being used to determine the value of a variable, the sum is used.
//   [2026-06-29] The second ability doesn't copy the triggered ability; it just causes the ability
//     to trigger an additional time. Any choices made as you put the ability onto the stack, such
//     as modes and targets, are made separately for each instance of the ability. Any choices made
//     on resolution, such as whether to put counters on a permanent, are also made individually.
//   [2026-06-29] Replacement effects are unaffected by Wizard's Staff's second ability.

const PROWESS: TriggeredAbility = {
  trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
  targets: [],
  effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
  resolve: null,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
};

export default defineCard({
  name: "Wizard's Staff",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature has prowess. (Whenever its controller casts a noncreature spell, that creature gets +1/+1 until end of turn.)\nIf a triggered ability of equipped creature triggers, that ability triggers an additional time.\nEquip Wizard {1}\nEquip {3}",
  activated: [
    {
      // "Equip Wizard {1}" (rule 702.6a's "Equip [quality]").
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Wizard" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Wizard {1}",
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [PROWESS],
      text: "Equipped creature has prowess.",
    },
    {
      // The host's triggers, whoever controls it — its granted prowess too.
      affects: { scope: "self" },
      doubleTriggersOf: { host: true },
      text: "If a triggered ability of equipped creature triggers, that ability triggers an additional time.",
    },
  ],
});
