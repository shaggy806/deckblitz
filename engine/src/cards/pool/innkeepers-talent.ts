import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel, ward } from "../helpers.js";

// EDHREC rank 692. A Class (rule 716). Level 2's ward is every counter-bearing
// permanent's own, already triggered ward staying if it later loses it (the
// ruling). Level 3 reads who puts them, as Vorinclex does.

const COMBAT_TEXT = "At the beginning of combat on your turn, put a +1/+1 counter on target creature you control.";
const WARD_TEXT = "Permanents you control with counters on them have ward {1}.";
const DOUBLE_TEXT =
  "If you would put one or more counters on a permanent or player, put twice that many of each of those kinds of counters on that permanent or player instead.";

export default defineCard({
  name: "Innkeeper's Talent",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${COMBAT_TEXT}\n{G}: Level 2\n${WARD_TEXT}\n{3}{G}: Level 3\n${DOUBLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  static: [
    atLevel(2, {
      affects: { scope: "filter", filter: { controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } } },
      grantsTriggered: [ward({ mana: "{1}" })],
      text: WARD_TEXT,
    }),
    atLevel(3, {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", instead: { modify: { times: 2 } }, whoPuts: "you", onPlayers: "any" },
      text: DOUBLE_TEXT,
    }),
  ],
  activated: [classLevel(2, "{G}"), classLevel(3, "{3}{G}")],
});
