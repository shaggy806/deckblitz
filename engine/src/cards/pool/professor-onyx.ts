import { defineCard } from "../define.js";

// EDHREC rank 2401.
//
// −3 is Crackling Doom's edict. −8 is seven passes of Nicol Bolas's punisher
// with only the discard: each opponent in turn order chooses a card face
// down (or none), the chosen cards are discarded together, and each who
// didn't discard loses 3 life — then the next pass (the ruling).

const MAGECRAFT =
  "Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 2 life and you gain 2 life.";
const PLUS =
  "+1: You lose 1 life. Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.";
const MINUS = "−3: Each opponent sacrifices a creature with the greatest power among creatures that player controls.";
const ULT = "−8: Each opponent may discard a card. If they don't, they lose 3 life. Repeat this process six more times.";

export default defineCard({
  name: "Professor Onyx",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 5,
  text: `${MAGECRAFT}\n${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1 },
          { kind: "look-and-choose", zone: "library", count: 3, min: 1, max: 1, destination: "hand", leftover: "graveyard" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "each-opponent",
        filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
        count: 1,
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "repeat",
        times: 7,
        effect: {
          kind: "each-player-may",
          who: "each-opponent",
          options: [{ discard: 1, text: "Discard a card" }],
          ifDidnt: { kind: "lose-life", amount: 3, who: "that-player" },
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", orCopy: true, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: MAGECRAFT,
    },
  ],
});
