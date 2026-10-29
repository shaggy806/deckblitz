import { defineCard } from "../define.js";

// EDHREC rank 1457.
//
// The modes are chosen as the ability is activated (rule 700.2b), the first
// with its own target. "Its activated abilities can't be activated this turn"
// is `prohibit` on that permanent, this stint of it — mana abilities included
// (the ruling: "Unlike similar effects, it does stop mana abilities").

const MODES_TEXT =
  "Sacrifice another Serpent: Choose one —\n• Tap target permanent. Its activated abilities can't be activated this turn.\n• Koma gains indestructible until end of turn.";

export default defineCard({
  name: "Koma, Cosmos Serpent",
  manaCost: "{3}{G}{G}{U}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 6,
  toughness: 6,
  cantBeCountered: true,
  text: `This spell can't be countered.\nAt the beginning of each upkeep, create a 3/3 blue Serpent creature token named Koma's Coil.\n${MODES_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Serpent" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Tap target permanent. Its activated abilities can't be activated this turn.",
            targets: ["permanent"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: 0 },
                { kind: "prohibit", target: 0, abilities: true },
              ],
            },
          },
          {
            text: "Koma gains indestructible until end of turn.",
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
      effect: { kind: "create-token", token: "Koma's Coil", count: 1 },
      resolve: null,
      text: "At the beginning of each upkeep, create a 3/3 blue Serpent creature token named Koma's Coil.",
    },
  ],
});
