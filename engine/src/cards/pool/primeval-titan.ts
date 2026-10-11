import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings:
//   You may find any land cards, not just basic land cards.
// "You may search": declining searches nothing and doesn't shuffle; the
// search itself finds up to two (none is a legal find).
const TRIGGER_TEXT =
  "Whenever this creature enters or attacks, you may search your library for up to two land cards, put them onto the battlefield tapped, then shuffle.";

const FETCH: EffectSpec = {
  kind: "may",
  prompt: "Search your library for up to two land cards?",
  effect: {
    kind: "search-library",
    filter: { type: "land" },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max: 2,
  },
};

export default defineCard({
  name: "Primeval Titan",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: FETCH,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: FETCH,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
