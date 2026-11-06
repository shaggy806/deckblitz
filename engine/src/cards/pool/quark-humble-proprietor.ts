import { defineCard } from "../define.js";

// EDHREC rank 25087.
// A player can sacrifice only permanents they control (rule 701.21a), so
// "you can't sacrifice Treasure tokens" is "Treasure tokens you control can't
// be sacrificed": no cost or effect of yours can, a Treasure's own mana
// ability included. A rule Quark imposes, not an ability the Treasures have,
// so a Treasure that loses its abilities is still held.

const SAC_TEXT = "You can't sacrifice Treasure tokens.";
const UPKEEP_TEXT =
  'At the beginning of each upkeep, create a Treasure token. (It\'s an artifact with "{T}, Sacrifice this token: Add one mana of any color.")';

export default defineCard({
  name: "Quark, Humble Proprietor",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ferengi", "Rogue"],
  power: 1,
  toughness: 2,
  text: `${SAC_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Treasure", token: true, controlledBy: "you" } },
      cantBeSacrificed: true,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
