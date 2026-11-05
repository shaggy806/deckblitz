import { defineCard } from "../define.js";

// Two picks in order (Choco's `secondPick`): the battlefield one first, with
// its indestructible counter as it enters, then one for the hand, which
// moves with the rest going to the graveyard.

const PERMANENT_CARD = { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] } as const;

export default defineCard({
  name: "Wakanda Forever!",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top six cards of your library. You may put a permanent card from among them onto the battlefield with an indestructible counter on it. You may put a permanent card from among them into your hand. Put the rest into your graveyard.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 6,
    reveal: true,
    min: 0,
    max: 1,
    filter: PERMANENT_CARD,
    destination: "battlefield",
    withCounters: { kind: "indestructible", amount: 1 },
    secondPick: { filter: PERMANENT_CARD, min: 0, max: 1, destination: "hand" },
    leftover: "graveyard",
  },
});
