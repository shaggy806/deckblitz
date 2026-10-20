import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const TEXT =
  "Whenever this creature enters or attacks, exile up to two target cards from graveyards. For each creature card exiled this way, each opponent loses 1 life and you gain 1 life.";
const TARGETS: TargetSpec[] = [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2 }];
const CREATURES_EXILED = { thisWay: "exiled", filter: { type: "creature" } } as const;
const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    // Rooftop Percher's shape: one exile of both.
    { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
    { kind: "lose-life", amount: CREATURES_EXILED, who: "each-opponent" },
    { kind: "gain-life", amount: CREATURES_EXILED },
  ],
};

export default defineCard({
  name: "Graveyard Glutton",
  art: "https://cards.scryfall.io/art_crop/back/d/a/daa2a273-488f-4285-a069-ad159ad2d393.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["nightbound"],
  text: `Ward—Discard a card.\n${TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  triggered: [
    ward({ discard: 1 }),
    { trigger: { on: "enters-battlefield", who: "self" }, targets: TARGETS, effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: TARGETS, effect: EFFECT, resolve: null, text: TEXT },
  ],
  faces: ["Graveyard Trespasser", "Graveyard Glutton"],
  transform: true,
});
