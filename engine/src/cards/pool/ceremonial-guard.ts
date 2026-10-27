import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// Mercadian Masques (MMQ). EDHREC rank 32162. Vebulid's combat triggers: one
// per event, each setting up a delayed trigger at end of combat.

const TEXT = "When this creature attacks or blocks, destroy it at end of combat.";

const destroyAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "destroy", target: "source" },
    text: "Destroy Ceremonial Guard.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Ceremonial Guard",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [destroyAtEndOfCombat("attacks"), destroyAtEndOfCombat("blocks")],
});
