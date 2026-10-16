import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Disguise {4}{R} (rule 702.168). One ability with two trigger events,
// written as two entries counted as one (`sameAbilityAs`).

const TEXT = "When this creature enters or is turned face up, up to one target creature gets +2/+0 until end of turn.";

const pump = (trigger: TriggeredAbility["trigger"], sameAbilityAs?: number): TriggeredAbility => ({
  trigger,
  ...(sameAbilityAs !== undefined ? { sameAbilityAs } : {}),
  targets: [{ kind: "optional", of: "creature" }],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Offender at Large",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Rogue"],
  power: 5,
  toughness: 4,
  text: `Disguise {4}{R} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${TEXT}`,
  morph: { keyword: "disguise", cost: "{4}{R}" },
  triggered: [pump({ on: "enters-battlefield", who: "self" }), pump({ on: "turned-face-up", who: "self" }, 0)],
});
