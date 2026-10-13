import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 9863. "Enters or attacks" is two triggers.
const TRIGGER = "Whenever this creature enters or attacks, each opponent loses 2 life. You gain 2 life and draw a card.";

const DRAIN: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "lose-life", amount: 2, who: "each-opponent" },
    { kind: "gain-life", amount: 2 },
    { kind: "draw", amount: 1 },
  ],
};

export default defineCard({
  name: "Shroudstomper",
  manaCost: "{3}{W}{W}{B}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TRIGGER}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: DRAIN, resolve: null, text: TRIGGER },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: DRAIN, resolve: null, text: TRIGGER },
  ],
});
