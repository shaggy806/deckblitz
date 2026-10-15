import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 16718.
//
// "Enters or attacks" is two triggers with one effect. With no target chosen
// the ability still resolves and you gain the life; with one chosen that's
// gone, it doesn't resolve at all (rule 608.2b).

const TEXT = "Whenever this creature enters or attacks, exile up to one target card from a graveyard. You gain 1 life.";
const TARGETS: TargetSpec[] = [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any" } }];
const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "exile", target: 0 },
    { kind: "gain-life", amount: 1 },
  ],
};

export default defineCard({
  name: "Wreck Remover",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 4,
  cycling: { cost: "{2}" },
  text: `${TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: TARGETS, effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: TARGETS, effect: EFFECT, resolve: null, text: TEXT },
  ],
});
