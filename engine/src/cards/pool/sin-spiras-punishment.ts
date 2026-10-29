import { defineCard } from "../define.js";

// EDHREC rank 9386. "Enters or attacks" is one ability with two trigger
// events (`sameAbilityAs`).
//
// Each pass picks a permanent card in your graveyard at random, exiles it and
// makes a tapped token copy of the card as printed (Restore Relic's shape —
// the rulings); it repeats while the card exiled this pass is a land.

const TEXT =
  "Whenever Sin enters or attacks, exile a permanent card from your graveyard at random, then create a tapped token that's a copy of that card. If the exiled card is a land card, repeat this process.";

const PROCESS = {
  kind: "repeat",
  effect: {
    kind: "choose-random-card",
    zone: "graveyard",
    filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
    then: {
      kind: "sequence",
      effects: [
        { kind: "exile", target: 0 },
        { kind: "create-token-copy", of: 0, count: 1, who: "you", tapped: true },
      ],
    },
  },
  again: { kind: "this-way", what: "exiled", filter: { type: "land" } },
} as const;

export default defineCard({
  name: "Sin, Spira's Punishment",
  manaCost: "{4}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Leviathan", "Avatar"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: PROCESS,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: PROCESS,
      resolve: null,
      text: TEXT,
    },
  ],
});
