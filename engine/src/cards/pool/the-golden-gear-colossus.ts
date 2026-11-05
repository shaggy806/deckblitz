import { defineCard } from "../define.js";

// Ruling: any double-faced artifact may be targeted, but only a transforming
// one transforms (a modal DFC doesn't).

const TEXT =
  "Whenever The Golden-Gear Colossus enters or attacks, transform up to one other target double-faced artifact you control. Create two 1/1 colorless Gnome artifact creature tokens.";
const targets = [
  {
    kind: "optional",
    of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "artifact", doubleFaced: true } } },
  },
] as const;
const effect = {
  kind: "sequence",
  effects: [
    { kind: "transform", target: 0 },
    { kind: "create-token", token: "Gnome Token", count: 2 },
  ],
} as const;

export default defineCard({
  name: "The Golden-Gear Colossus",
  art: "https://cards.scryfall.io/art_crop/back/0/5/0502deea-95ad-4b6d-a3ac-d3adcd607624.jpg",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets, effect, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, sameAbilityAs: 0, targets, effect, resolve: null, text: TEXT },
  ],
  faces: ["Tetzin, Gnome Champion", "The Golden-Gear Colossus"],
  transform: true,
});
