import { defineCard } from "../define.js";

// The back face of Jin-Gitaxias.
//
// Rulings:
//   [2023-04-14] A spell you cast this way can be the target of a later spell you cast this way.
//     However, permanent spells cast this way won't resolve until you're done casting spells.
//
// - Chapter I's "no maximum hand size for as long as you control this Saga"
//   is an effect of the resolved ability with a duration (rule 611.2b), not a
//   static ability: it ends for good when the Saga leaves or changes hands,
//   which chapter III's exile does.
// - Chapter III casts the spells as it resolves (`cast-now`, repeating), then
//   exiles and returns the Saga front face up (rule 712.14).
const CHAPTER_I =
  "I — Draw cards equal to the number of cards in your hand. You have no maximum hand size for as long as you control this Saga.";
const CHAPTER_II = "II — Return all non-Phyrexian creatures to their owners' hands.";
const CHAPTER_III =
  "III — You may cast any number of spells from your hand without paying their mana costs. " +
  "Exile this Saga, then return it to the battlefield (front face up).";

export default defineCard({
  name: "The Great Synthesis",
  art: "https://cards.scryfall.io/art_crop/back/4/1/41c83142-b948-4ee5-a486-41306d2bb411.jpg",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Jin-Gitaxias", "The Great Synthesis"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { cardsInHand: "you" } },
          { kind: "player-effect", duration: "while-you-control-source", noMaxHandSize: "you" },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "return-to-hand-all", filter: { type: "creature", notSubtypes: ["Phyrexian"] } },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "cast-now", from: "hand", free: true, repeat: true },
          { kind: "flicker", target: "source" },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
