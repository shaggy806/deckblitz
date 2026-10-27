import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";
import { affinity } from "../helpers.js";

// Darksteel. EDHREC rank 27741. Wall of Junk's delayed return, on attacking
// as well as blocking (Fog Elemental's two triggers).

const TEXT = "When this creature attacks or blocks, return it to its owner's hand at end of combat.";

const returnAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "return-to-hand", target: "source" },
    text: "Return Quicksilver Behemoth to its owner's hand.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Quicksilver Behemoth",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 5,
  selfCostReduction: affinity({ type: "artifact" }),
  text: `Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\n${TEXT} (Return it only if it's on the battlefield.)`,
  triggered: [returnAtEndOfCombat("attacks"), returnAtEndOfCombat("blocks")],
});
