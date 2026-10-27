import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// Mercadian Masques (MMQ). EDHREC rank 31657. Vebulid's combat triggers, one
// per event, each setting up a delayed trigger at end of combat that puts
// this creature (Fencer Clique's `put-on-library` of the source) on top.

const TEXT = "When this creature attacks or blocks, put it on top of its owner's library at end of combat.";

const topAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "put-on-library", target: "source", position: "top" },
    text: "Put Saprazzan Outrigger on top of its owner's library.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Saprazzan Outrigger",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [topAtEndOfCombat("attacks"), topAtEndOfCombat("blocks")],
});
