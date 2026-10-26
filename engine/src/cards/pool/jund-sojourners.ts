import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// One ability with two trigger events, written as two entries counted as one
// (`sameAbilityAs`). Rulings: it can be cycled with no target for the trigger;
// the trigger resolves before the cycling draw.

const TEXT = "When you cycle this card and when this creature dies, you may have it deal 1 damage to any target.";

const ping = (trigger: TriggeredAbility["trigger"], sameAbilityAs?: number): TriggeredAbility => ({
  trigger,
  ...(sameAbilityAs !== undefined ? { sameAbilityAs } : {}),
  targets: ["any-target"],
  effect: {
    kind: "may",
    prompt: "Have Jund Sojourners deal 1 damage to the target?",
    effect: { kind: "damage", amount: 1, target: 0 },
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Jund Sojourners",
  manaCost: "{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 3,
  toughness: 2,
  cycling: { cost: "{2}{R}" },
  text: `${TEXT}\nCycling {2}{R} ({2}{R}, Discard this card: Draw a card.)`,
  triggered: [ping({ on: "this-cycled" }), ping({ on: "dies", who: "self" }, 0)],
});
