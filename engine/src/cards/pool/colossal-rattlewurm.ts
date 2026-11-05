import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// EDHREC rank 10298.
//
// Rulings:
//   [2024-04-12] The game checks whether it is legal to cast a spell before costs are determined
//     or mana abilities are activated while casting it.
//
// "Has flash as long as you control a Desert" works from the hand as the cast
// begins (`flashIf`, rule 601.3d) and on the battlefield as a keyword it has
// (a static, which "a permanent with flash" reads). The graveyard ability
// exiles this card as its cost (`zone: "graveyard"`).
const DESERT: StaticCondition = { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 };
const FLASH_TEXT = "Colossal Rattlewurm has flash as long as you control a Desert.";
const SEARCH_TEXT =
  "{1}{G}, Exile this card from your graveyard: Search your library for a Desert card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Colossal Rattlewurm",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  flashIf: { condition: DESERT },
  text: `${FLASH_TEXT}\nTrample\n${SEARCH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: DESERT,
      grantKeywords: ["flash"],
      text: FLASH_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      zone: "graveyard",
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Desert" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
