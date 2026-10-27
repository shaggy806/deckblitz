import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// Odyssey. EDHREC rank 31543. Quicksilver Behemoth's two triggers.

const TEXT = "When this creature attacks or blocks, return it to its owner's hand at end of combat.";

const returnAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "return-to-hand", target: "source" },
    text: "Return Phantom Whelp to its owner's hand.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Phantom Whelp",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Dog"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (Return it only if it's on the battlefield.)`,
  triggered: [returnAtEndOfCombat("attacks"), returnAtEndOfCombat("blocks")],
});
