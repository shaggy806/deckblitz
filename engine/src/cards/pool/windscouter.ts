import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// Prophecy. EDHREC rank 32006. Quicksilver Behemoth's two delayed returns.

const TEXT = "When this creature attacks or blocks, return it to its owner's hand at end of combat.";

const returnAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "return-to-hand", target: "source" },
    text: "Return Windscouter to its owner's hand.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Windscouter",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Return it only if it's on the battlefield.)`,
  triggered: [returnAtEndOfCombat("attacks"), returnAtEndOfCombat("blocks")],
});
