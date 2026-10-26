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
    text: "Sacrifice Fog Elemental.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Fog Elemental",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${TEXT}`,
  triggered: [sacrificeAtEndOfCombat("attacks"), sacrificeAtEndOfCombat("blocks")],
});
