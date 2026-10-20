import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 15480. "When Dorothea attacks or blocks, sacrifice it at end of
// combat" is a trigger per event, each setting up a delayed trigger at end of
// combat keyed to this permanent (Wall of Junk's shape): one that has left
// the battlefield since isn't sacrificed, even if it came back (rule 400.7).
// The back face, cast with disturb, is the Aura Dorothea's Retribution.
const COMBAT_TEXT = "When Dorothea attacks or blocks, sacrifice it at end of combat.";

const sacrificeAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "sacrifice-target", target: "source" },
    text: "Sacrifice Dorothea, Vengeful Victim.",
  },
  resolve: null,
  text: COMBAT_TEXT,
});

export default defineCard({
  name: "Dorothea, Vengeful Victim",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  disturb: { cost: "{1}{W}{U}" },
  text: `Flying\n${COMBAT_TEXT}\nDisturb {1}{W}{U} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  triggered: [sacrificeAtEndOfCombat("attacks"), sacrificeAtEndOfCombat("blocks")],
  faces: ["Dorothea, Vengeful Victim", "Dorothea's Retribution"],
  transform: true,
});
