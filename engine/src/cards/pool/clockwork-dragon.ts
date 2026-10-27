import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 21341. Mirrodin.
//
// Wicker Warcrawler's shape: a trigger per event, each setting up a delayed
// trigger at end of combat that removes the counter.

const COMBAT_TEXT = "Whenever this creature attacks or blocks, remove a +1/+1 counter from it at end of combat.";
const ENTERS_TEXT = "This creature enters with six +1/+1 counters on it.";

const counterOffAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
    text: "Remove a +1/+1 counter from Clockwork Dragon.",
  },
  resolve: null,
  text: COMBAT_TEXT,
});

export default defineCard({
  name: "Clockwork Dragon",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${COMBAT_TEXT}\n{3}: Put a +1/+1 counter on this creature.`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{3}: Put a +1/+1 counter on this creature.",
    },
  ],
  triggered: [counterOffAtEndOfCombat("attacks"), counterOffAtEndOfCombat("blocks")],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 6 } },
      text: ENTERS_TEXT,
    },
  ],
});
