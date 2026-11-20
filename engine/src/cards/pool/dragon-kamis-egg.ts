import { defineCard } from "../define.js";

// The Dragon-Kami Reborn's back face. "This creature or a Dragon you control"
// is two triggers, the Dragon one `otherOnly` so an Egg made a Dragon still
// triggers once. Its cards are face down in exile: castable while their owner
// may look at them (rule 406.3b), as `exiledOwnedWithCounter` reads them.
// Several dying at once trigger once each (the ruling).

const TEXT =
  "Whenever this creature or a Dragon you control dies, you may cast a creature spell from among cards you own in exile with hatching counters on them without paying its mana cost.";

const CAST = {
  kind: "cast-now",
  from: { exiledOwnedWithCounter: "hatching" },
  spell: { type: "creature" },
  free: true,
} as const;

export default defineCard({
  name: "Dragon-Kami's Egg",
  art: "https://cards.scryfall.io/art_crop/back/2/5/2534caaa-a793-415f-977f-1d0fac3642ab.jpg",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Egg"],
  power: 0,
  toughness: 1,
  text: TEXT,
  triggered: [
    { trigger: { on: "dies", who: "self" }, targets: [], effect: CAST, resolve: null, text: TEXT },
    {
      trigger: { on: "dies", who: "you-control", filter: { subtype: "Dragon" }, otherOnly: true },
      targets: [],
      effect: CAST,
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["The Dragon-Kami Reborn", "Dragon-Kami's Egg"],
  transform: true,
});
