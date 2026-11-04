import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// The back face of Sheoldred.
//
// Rulings:
//   To resolve chapter II of The True Scriptures in a multiplayer game, the next opponent in turn
//   order chooses three cards in hand, then each other opponent does the same; all chosen cards
//   are discarded at the same time. Then each opponent mills three cards.
//
// - Chapter I is one optional slot per opponent seat (Age of Ultron's shape),
//   destroyed as one instruction.
// - Chapter III's return says nothing of its owner, so it comes back under the
//   control of the player the ability tells to do it (rule 110.2a), and front
//   face up by default (rule 712.14): `flicker`'s `underYourControl`, without
//   `transformed`.
const CHAPTER_I = "I — For each opponent, destroy up to one target creature or planeswalker that player controls.";
const CHAPTER_II = "II — Each opponent discards three cards, then mills three cards.";
const CHAPTER_III =
  "III — Put all creature cards from all graveyards onto the battlefield under your control. " +
  "Exile this Saga, then return it to the battlefield (front face up).";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { typesAnyOf: ["creature", "planeswalker"] } },
});

export default defineCard({
  name: "The True Scriptures",
  art: "https://cards.scryfall.io/art_crop/back/b/f/bf2249e6-af74-4b88-8eb7-144ce8fa7f6b.jpg",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "destroy", target: 1 },
          { kind: "destroy", target: 2 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 3 },
          { kind: "mill", target: "each-opponent", amount: 3 },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "return-from-graveyard",
            from: "all-graveyards",
            filter: { type: "creature" },
            destination: "battlefield",
            count: "all",
          },
          { kind: "flicker", target: "source", underYourControl: true },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
  faces: ["Sheoldred", "The True Scriptures"],
  transform: true,
});
