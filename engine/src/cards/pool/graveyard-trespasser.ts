import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const TEXT =
  "Whenever this creature enters or attacks, exile up to one target card from a graveyard. If a creature card was exiled this way, each opponent loses 1 life and you gain 1 life.";
const TARGETS: TargetSpec[] = [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any" } }];
// Diregraf Scavenger's shape.
const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "exile", target: 0 },
    {
      kind: "conditional",
      condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
      then: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
    },
  ],
};

export default defineCard({
  name: "Graveyard Trespasser",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["daybound"],
  text: `Ward—Discard a card.\n${TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
  triggered: [
    ward({ discard: 1 }),
    { trigger: { on: "enters-battlefield", who: "self" }, targets: TARGETS, effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: TARGETS, effect: EFFECT, resolve: null, text: TEXT },
  ],
  faces: ["Graveyard Trespasser", "Graveyard Glutton"],
  transform: true,
});
