import { defineCard } from "../define.js";
import { equip, mentor } from "../helpers.js";

// Ravnica: Clue Edition. EDHREC rank 14647.
// "Whenever equipped creature mentors a creature" (rule 702.134c): whenever a
// mentor ability whose source is the equipped creature resolves, its target
// still legal — the granted one or one of its own. Equipped as the ability
// resolves, not as it triggered (the ruling): moved off before then, it
// doesn't trigger; moved onto the creature since, it does. "That creature" is
// the one mentored.

const STATIC_TEXT = "Equipped creature gets +1/+1 and has mentor.";
const SHIELD_TEXT = "Whenever equipped creature mentors a creature, put a shield counter on that creature.";

export default defineCard({
  name: "Aegis of the Legion",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    `${STATIC_TEXT} (Whenever it attacks, put a +1/+1 counter on target attacking creature with lesser power.)\n` +
    `${SHIELD_TEXT} (If that creature would be dealt damage or destroyed, remove a shield counter from it instead.)\n` +
    "Equip {3}",
  activated: [equip("{3}")],
  triggered: [
    {
      trigger: { on: "event", event: "mentors", who: "attached" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-recipient", counter: "shield", amount: 1 },
      resolve: null,
      text: SHIELD_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], grantsTriggered: [mentor()], text: STATIC_TEXT }],
});
