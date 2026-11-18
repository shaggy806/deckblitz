import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 15963.
//
// Rulings:
//   If multiple cards would be put into the enchanted player's graveyard at the same time (due to
//     Millstone, for example), they are instead all revealed and put on the bottom of the enchanted
//     player's library at the same time. That player chooses what order to put them in. The order
//     is not revealed to the other players.
//   Wheel of Sun and Moon won't affect tokens that are put into the graveyard from the battlefield
//     or copies of spells that resolve or are countered. They're not cards, so they'll go to the
//     graveyard as normal, then cease to exist.
//   Wheel of Sun and Moon's replacement effect will apply to cards that would be put into the
//     enchanted player's graveyard from any game zone.
//
// Another permanent's graveyard replacement with no `from` (a card from anywhere), `reveal`, onto
// `"library-bottom"`, over the cards the enchanted player owns (`ownedBy: "enchanted-player"` — a
// card goes to its owner's graveyard, rule 400.3). Several at once are arranged by that player
// (rule 401.4, the first ruling), asked as the event ends.
const TEXT =
  "If a card would be put into enchanted player's graveyard from anywhere, instead that card is revealed and put on the bottom of that player's library.";

export default defineCard({
  name: "Wheel of Sun and Moon",
  manaCost: "{G/W}{G/W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "library-bottom",
        filter: { ownedBy: "enchanted-player", token: false },
        reveal: true,
      },
      text: TEXT,
    },
  ],
});
