import { defineCard } from "../define.js";

// EDHREC rank 32205.

const LANDFALL_TEXT =
  'Landfall — Whenever a land you control enters, create a 2/2 red and green Worm creature token with "This token can\'t block."';
const PUMP_TEXT = "{8}: Creatures you control get +2/+0 until end of turn.";

export default defineCard({
  name: "Cleveland Booker, Empath",
  manaCost: "{2}{R/G}{R/G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kwejian", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${LANDFALL_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Red Green Worm Token", count: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
