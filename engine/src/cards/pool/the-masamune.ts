import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// - The doubler is the equipped creature's own static while it's granted
//   (`grantsStatic`, rule 113.10): "this creature" is that creature, and
//   `selfOrEmblems` keeps it to that creature's abilities and its
//   controller's emblems' — another permanent's aren't doubled.
// - A creature dying at the same time as the equipped one, itself included,
//   still triggers an additional time (ruling): the death looks back at the
//   doubler it had been granted (`grantedDoublers` on its last-known
//   snapshot).
// - Leaves-the-battlefield triggers caused by a death count too ("dies"
//   cause); "whenever you sacrifice" isn't caused by the dying.

const ATTACKING = "As long as equipped creature is attacking, it has first strike and must be blocked if able.";
const DOUBLE_TEXT =
  "If a creature dying causes a triggered ability of this creature or an emblem you own to trigger, that ability triggers an additional time.";
const GRANT = `Equipped creature has "${DOUBLE_TEXT}"`;

export default defineCard({
  name: "The Masamune",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACKING}\n${GRANT}\nEquip {2}`,
  activated: [equip("{2}")],
  static: [
    {
      affects: { scope: "filter", filter: { hostOfSource: true, attacking: true } },
      grantKeywords: ["first-strike"],
      restrictions: ["must-be-blocked-if-able"],
      text: ATTACKING,
    },
    {
      affects: { scope: "attached" },
      grantsStatic: [
        {
          affects: { scope: "self" },
          doubleTriggers: { cause: "dies", filter: { type: "creature" }, selfOrEmblems: true },
          text: DOUBLE_TEXT,
        },
      ],
      text: GRANT,
    },
  ],
});
