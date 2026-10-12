import { defineCard } from "../define.js";

// EDHREC rank 9910.

const NONLAND_PERMANENT = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"], notTypes: ["land"] },
} as const;
const LAND = { kind: "card-in-graveyard", whose: "you", filter: { type: "land" } } as const;

export default defineCard({
  name: "Pull Through the Weft",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return up to two target nonland permanent cards from your graveyard to your hand, then return up to two target land cards from your graveyard to the battlefield tapped.",
  // Four optional slots: two nonland permanent cards (Fight On!'s pair), two
  // land cards (Lord Windgrace's pair). Each pair moves as one event.
  targets: [
    { kind: "optional", of: NONLAND_PERMANENT },
    { kind: "optional", of: { kind: "other", of: NONLAND_PERMANENT, than: { slots: [0] } } },
    { kind: "optional", of: LAND },
    { kind: "optional", of: { kind: "other", of: LAND, than: { slots: [2] } } },
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
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "put-onto-battlefield", target: 2, enterTapped: true },
          { kind: "put-onto-battlefield", target: 3, enterTapped: true },
        ],
      },
    ],
  },
});
