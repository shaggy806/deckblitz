import { defineCard } from "../define.js";

// EDHREC rank 591.
// Rulings:
//   [2020-11-10] The cards found in the search will be exiled rather than be put wherever the spell
//     or ability tells the opponent to put them after finding them. Any other effects the spell or
//     ability has will still apply. If such an effect refers to the found cards, it can't see them
//     in exile.
//   [2020-11-10] If more than one player controls an Opposition Agent, and another player searches
//     their library, the controller of the Opposition Agent that most recently entered the
//     battlefield controls that player during the search. [...] the owner of the exiled card chooses
//     which effect wins. However, that owner will be under another player's control [...]
//   [2020-11-10] If a spell or ability instructs an opponent you control to search multiple zones
//     including the library, you decide what cards they find in all zones. They'll exile all cards
//     they find in any of the zones.

const CONTROL_TEXT = "You control your opponents while they're searching their libraries.";
const EXILE_TEXT =
  "While an opponent is searching their library, they exile each card they find. You may play those cards for as long as they remain exiled, and you may spend mana as though it were mana of any color to cast them.";

export default defineCard({
  name: "Opposition Agent",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${CONTROL_TEXT}\n${EXILE_TEXT}`,
  static: [
    { affects: { scope: "self" }, controlsOpponentsSearching: true, text: CONTROL_TEXT },
    { affects: { scope: "self" }, exilesOpponentsFinds: { spendAs: "any-color" }, text: EXILE_TEXT },
  ],
});
