import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 25267.

const TEXT = "Whenever this creature attacks or blocks, remove a +1/+1 counter from it at end of combat.";

const removeAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
    text: "Remove a +1/+1 counter from Clockwork Vorrac.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Clockwork Vorrac",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Boar", "Beast"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\nThis creature enters with four +1/+1 counters on it.\n${TEXT}\n{T}: Put a +1/+1 counter on this creature.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{T}: Put a +1/+1 counter on this creature.",
    },
  ],
  triggered: [removeAtEndOfCombat("attacks"), removeAtEndOfCombat("blocks")],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: "This creature enters with four +1/+1 counters on it.",
    },
  ],
});
