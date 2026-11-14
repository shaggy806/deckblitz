import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// - Only activated abilities are gained (the ruling): what the artifact has as this resolves,
//   keyword ones with a colon included; each Horror treats them as its own ("this permanent").
// - The Horrors are those you control as it resolves (rule 611.2c); one that comes later gains
//   nothing. Blue mana may be spent as though any color (rule 609.4b) only to activate the
//   abilities this gave, and only by you, until end of turn.

const TEXT =
  "Aberrant Tinkering — When this creature enters and at the beginning of your upkeep, each Horror you control gains all activated abilities of target artifact an opponent controls until end of turn. You may spend blue mana as though it were mana of any color to activate those abilities.";

const TINKER: EffectSpec = {
  kind: "grant-activated-of",
  target: "source",
  filter: { subtype: "Horror", controlledBy: "you" },
  of: 0,
  duration: "end-of-turn",
  spendAs: { unit: "U", as: "any-color" },
};
const ARTIFACT = { kind: "permanent", whose: "opponent", filter: { type: "artifact" } } as const;

export default defineCard({
  name: "Grell Philosopher",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horror", "Wizard"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [ARTIFACT],
      effect: TINKER,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [ARTIFACT],
      effect: TINKER,
      resolve: null,
      text: TEXT,
    },
  ],
});
