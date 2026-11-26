import { defineCard } from "../define.js";

// EDHREC rank 21104.
// Rulings:
//   Creature cards that have abilities that grant the listed keyword abilities to themselves won't
//     count. For example, exiling a Battle Brawler (a creature with "As long as you control a red
//     or white permanent, Battle Brawler gets +1/+0 and has first strike") with Soulflayer's delve
//     ability won't cause Soulflayer to have first strike, even if you control a red or white
//     permanent.
//   You can't exile more cards from your graveyard than you'd need to pay Soulflayer's generic mana
//     requirement. In most situations, this means you can't exile more than four cards, even if
//     you want to exile more to give it extra abilities.
//   If one of those creature cards has one or more variants of the listed keywords (for example,
//     hexproof from white), this creature gains those specific variants.
//
// A printed delve links the cards it exiled to the permanent the spell
// becomes (rule 607.2q), so "exiled with this creature's delve ability" is
// `sharesKeywords`' `"exiled-with-source"`, creature cards alone. What a card
// grants itself only with a condition doesn't count (the first ruling), and
// "hexproof" brings each "hexproof from" (the third).

const KEYWORDS_TEXT =
  "If a creature card with flying was exiled with this creature's delve ability, this creature has flying. The same is true for first strike, double strike, deathtouch, haste, hexproof, indestructible, lifelink, reach, trample, and vigilance.";

export default defineCard({
  name: "Soulflayer",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  delve: true,
  text: `Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\n${KEYWORDS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      sharesKeywords: {
        from: "exiled-with-source",
        filter: { type: "creature" },
        keywords: [
          "flying",
          "first-strike",
          "double-strike",
          "deathtouch",
          "haste",
          "hexproof",
          "indestructible",
          "lifelink",
          "reach",
          "trample",
          "vigilance",
        ],
      },
      text: KEYWORDS_TEXT,
    },
  ],
});
