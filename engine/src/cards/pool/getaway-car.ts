import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// "Attacks or blocks" is two triggers, one per event. "A creature that
// crewed it this turn" (rule 702.122c) is `crewedSource`, read against the
// Car as the target is chosen.
const BOUNCE_TEXT =
  "Whenever this Vehicle attacks or blocks, return up to one target creature that crewed it this turn to its owner's hand.";

const bounce = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", crewedSource: true } } }],
  effect: { kind: "return-to-hand", target: 0 },
  resolve: null,
  text: BOUNCE_TEXT,
});

export default defineCard({
  name: "Getaway Car",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${BOUNCE_TEXT}\n${crewText(1)}`,
  triggered: [bounce("attacks"), bounce("blocks")],
  activated: [crew(1, crewText(1))],
});
