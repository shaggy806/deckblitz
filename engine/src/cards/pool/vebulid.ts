import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 26451.
//
// Rulings:
//   [2004-10-04] Adding a counter is optional. If you forget to add one during your upkeep, you
//     cannot back up and add one later.
//
// "When this creature attacks or blocks, destroy it at end of combat" is a
// trigger per event, each setting up a delayed trigger at end of combat
// (Dorothea, Vengeful Victim's shape; Cinder Wall's destroy).
const COMBAT_TEXT = "When this creature attacks or blocks, destroy it at end of combat.";

const destroyAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "destroy", target: "source" },
    text: "Destroy Vebulid.",
  },
  resolve: null,
  text: COMBAT_TEXT,
});

export default defineCard({
  name: "Vebulid",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 0,
  toughness: 0,
  text: `This creature enters with a +1/+1 counter on it.\nAt the beginning of your upkeep, you may put a +1/+1 counter on this creature.\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Vebulid?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a +1/+1 counter on this creature.",
    },
    destroyAtEndOfCombat("attacks"),
    destroyAtEndOfCombat("blocks"),
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});
