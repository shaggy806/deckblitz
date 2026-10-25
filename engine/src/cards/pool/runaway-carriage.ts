import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

const TEXT = "When this creature attacks or blocks, sacrifice it at end of combat.";

const sacrificeAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "sacrifice-target", target: "source" },
    text: "Sacrifice Runaway Carriage.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Runaway Carriage",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [sacrificeAtEndOfCombat("attacks"), sacrificeAtEndOfCombat("blocks")],
});
