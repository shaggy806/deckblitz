import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 31197. One ability with two trigger events, written as two
// entries counted as one (`sameAbilityAs` — Offender at Large).

const TEXT = "When this creature enters or is turned face up, another target creature you control gets +3/+0 until end of turn.";

const pump = (trigger: TriggeredAbility["trigger"], sameAbilityAs?: number): TriggeredAbility => ({
  trigger,
  ...(sameAbilityAs !== undefined ? { sameAbilityAs } : {}),
  targets: [{ kind: "other", of: "creature-you-control" }],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Efreet Weaponmaster",
  manaCost: "{3}{U}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["creature"],
  subtypes: ["Efreet", "Monk"],
  power: 4,
  toughness: 3,
  keywords: ["first-strike"],
  morph: { keyword: "morph", cost: "{2}{U}{R}{W}" },
  text: `First strike\n${TEXT}\nMorph {2}{U}{R}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [pump({ on: "enters-battlefield", who: "self" }), pump({ on: "turned-face-up", who: "self" }, 0)],
});
