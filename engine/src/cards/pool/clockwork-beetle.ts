import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// Mirrodin (MRD). EDHREC rank 20224.

const TEXT = "Whenever this creature attacks or blocks, remove a +1/+1 counter from it at end of combat.";

const shrinkAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
    text: "Remove a +1/+1 counter from Clockwork Beetle.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Clockwork Beetle",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 0,
  text: `This creature enters with two +1/+1 counters on it.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
  triggered: [shrinkAtEndOfCombat("attacks"), shrinkAtEndOfCombat("blocks")],
});
