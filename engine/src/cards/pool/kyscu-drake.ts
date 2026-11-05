import { defineCard } from "../define.js";

// EDHREC rank 32052. Searching for a named card: finding it is optional (the
// ruling).
const PUMP_TEXT = "{G}: This creature gets +0/+1 until end of turn. Activate only once each turn.";
const SEARCH_TEXT =
  "Sacrifice this creature and a creature named Spitting Drake: Search your library for a card named Viashivan Dragon, put that card onto the battlefield, then shuffle.";

export default defineCard({
  name: "Kyscu Drake",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}\n${SEARCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      oncePerTurn: true,
      text: PUMP_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        sacrifice: { each: [{ isSource: true }, { type: "creature", name: "Spitting Drake" }] },
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Viashivan Dragon" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
