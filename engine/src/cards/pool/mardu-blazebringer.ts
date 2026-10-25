import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 30990.

const TEXT = "When this creature attacks or blocks, sacrifice it at end of combat.";

const sacrificeAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "sacrifice-target", target: "source" },
    text: "Sacrifice Mardu Blazebringer.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Mardu Blazebringer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [sacrificeAtEndOfCombat("attacks"), sacrificeAtEndOfCombat("blocks")],
});
