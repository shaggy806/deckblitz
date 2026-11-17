import { defineCard } from "../define.js";

// EDHREC rank 11922.
//
// Rulings:
//   Cairn Wanderer's ability looks at all cards in all graveyards. It gains any landwalk abilities
//   and any protection abilities.
//
// The creature cards in every graveyard are the set it reads (`sharesKeywords` from `{ graveyard
// }`): it has each listed keyword one of them has, their protection abilities (702.16a) and their
// landwalk abilities (702.14a), named or not.

const KEYWORDS_TEXT =
  "As long as a creature card with flying is in a graveyard, this creature has flying. The same is true for fear, first strike, double strike, deathtouch, haste, landwalk, lifelink, protection, reach, trample, shroud, and vigilance.";

export default defineCard({
  name: "Cairn Wanderer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 4,
  keywords: ["changeling"],
  text: `Changeling (This card is every creature type.)\n${KEYWORDS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      sharesKeywords: {
        from: { graveyard: { type: "creature" } },
        keywords: [
          "flying",
          "fear",
          "first-strike",
          "double-strike",
          "deathtouch",
          "haste",
          "lifelink",
          "reach",
          "trample",
          "shroud",
          "vigilance",
        ],
        protection: true,
        landwalk: true,
      },
      text: KEYWORDS_TEXT,
    },
  ],
});
