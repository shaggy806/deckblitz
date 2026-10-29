import { defineCard } from "../define.js";

const returnable = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { typesAnyOf: ["creature", "land", "planeswalker"] },
} as const;

export default defineCard({
  name: "Restorative Burst",
  art: "https://cards.scryfall.io/art_crop/back/a/a/aaa1e6be-08cc-4ccc-b2de-3511613e4fd0.jpg",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return up to two target creature, land, and/or planeswalker cards from your graveyard to your hand. Each player gains 4 life. Exile Restorative Burst.",
  targets: [
    { kind: "optional", of: returnable },
    { kind: "optional", of: { kind: "other", of: returnable, than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      { kind: "gain-life", amount: 4, who: "each-player" },
    ],
  },
  exileOnResolve: true,
  faces: ["Pestilent Cauldron", "Restorative Burst"],
});
