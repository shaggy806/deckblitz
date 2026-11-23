import { defineCard } from "../define.js";

// Koma, Cosmos Serpent's shape: the upkeep token is Toski's Coil, and the
// sacrifice takes another Serpent or Squirrel.

const UPKEEP_TEXT =
  "At the beginning of each upkeep, create a 1/1 Phyrexian Serpent Squirrel artifact creature token named Toski's Coil with \"Whenever this creature deals combat damage to a player, draw a card.\"";
const MODES_TEXT =
  "Sacrifice another Serpent or Squirrel: Choose one —\n• Target creature attacks this turn if able. Its activated abilities can't be activated this turn.\n• Koma and Toski, Compleated gains indestructible until end of turn.";

export default defineCard({
  name: "Koma and Toski, Compleated",
  manaCost: "{6}{U}{G}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Serpent", "Squirrel"],
  power: 7,
  toughness: 7,
  cantBeCountered: true,
  text: `This spell can't be countered.\n${UPKEEP_TEXT}\n${MODES_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtypes: ["Serpent", "Squirrel"] } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Target creature attacks this turn if able. Its activated abilities can't be activated this turn.",
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "restrict", target: 0, restrictions: ["must-attack"] },
                { kind: "prohibit", prohibits: [{ act: "activate", who: "each-player", target: 0 }] },
              ],
            },
          },
          {
            text: "Koma and Toski, Compleated gains indestructible until end of turn.",
            effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: MODES_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "create-token", token: "Toski's Coil", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
