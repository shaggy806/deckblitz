import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 8582. Modern Horizons 3.
//
// Devoid: colourless in every zone (`colors: []`). One printed ability with two
// trigger events, so two triggered abilities with the same effect. The cast
// trigger resolves while the spell is still on the stack, so the Vanguard
// itself gets no counter from it (the ruling); attacking, it's a colourless
// creature you control and gets one.

const TEXT =
  "When you cast this spell and whenever this creature attacks, put a +1/+1 counter on each colorless creature you control.";

const GROW: EffectSpec = {
  kind: "add-counter-all",
  filter: { type: "creature", colorless: true, controlledBy: "you" },
  counter: "+1/+1",
  amount: 1,
};

export default defineCard({
  name: "Titans' Vanguard",
  manaCost: "{3}{R}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Devoid (This card has no color.)\n${TEXT}\nTrample`,
  triggered: [
    { trigger: { on: "this-cast" }, targets: [], effect: GROW, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: GROW, resolve: null, text: TEXT },
  ],
});
