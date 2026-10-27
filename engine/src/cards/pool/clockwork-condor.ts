import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 26678. Mirrodin.
//
// Wicker Warcrawler's shape: a trigger per event, each setting up a delayed
// trigger at end of combat that removes the counter.

const COMBAT_TEXT = "Whenever this creature attacks or blocks, remove a +1/+1 counter from it at end of combat.";
const ENTERS_TEXT = "This creature enters with three +1/+1 counters on it.";

const counterOffAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
    text: "Remove a +1/+1 counter from Clockwork Condor.",
  },
  resolve: null,
  text: COMBAT_TEXT,
});

export default defineCard({
  name: "Clockwork Condor",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Bird"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${COMBAT_TEXT}`,
  triggered: [counterOffAtEndOfCombat("attacks"), counterOffAtEndOfCombat("blocks")],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: ENTERS_TEXT,
    },
  ],
});
