import { defineCard } from "../define.js";

// The back face of Urabrask.
//
// Rulings:
//   [2023-04-14] If multiple players are allowed to cast the same card, the player with priority
//     at any given time determines who can cast it. The player whose turn it is has priority as
//     each step and phase begins, and they receive priority after each spell and ability resolves.
//     This means immediately after chapter III resolves you'll have priority to cast spells before
//     any other player does.
//   [2023-04-14] After chapter III of The Great Work resolves, casting spells from graveyards
//     follows the normal rules for casting those cards. You must pay their costs, and you must
//     follow all applicable timing rules.
//
// - Chapter III's return says nothing of its owner, so it comes back under the
//   control of the player the ability tells to do it (rule 110.2a), and front
//   face up by default (rule 712.14): `flicker`'s `underYourControl`, without
//   `transformed`.
const CHAPTER_I = "I — This Saga deals 3 damage to target opponent and each creature they control.";
const CHAPTER_II = "II — Create three Treasure tokens.";
const CHAPTER_III =
  "III — Until end of turn, you may cast instant and sorcery spells from any graveyard. If a spell cast this way " +
  "would be put into a graveyard, exile it instead. Exile this Saga, then return it to the battlefield (front face up).";

export default defineCard({
  name: "The Great Work",
  art: "https://cards.scryfall.io/art_crop/back/7/1/712fb9e5-bd67-4173-a2d4-061aeb6253b5.jpg",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "damage-all", filter: { type: "creature" }, amount: 3, controlledByTarget: 0 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 3 },
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
            kind: "player-effect",
            duration: "end-of-turn",
            castFromGraveyard: {
              filter: { typesAnyOf: ["instant", "sorcery"] },
              whose: "each-player",
              exileAfterwards: true,
            },
          },
          { kind: "flicker", target: "source", underYourControl: true },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
  faces: ["Urabrask", "The Great Work"],
  transform: true,
});
