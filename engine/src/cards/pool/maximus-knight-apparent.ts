import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When Maximus enters, you may search your library for an Equipment card with mana value 2, reveal it, put it into your hand, then shuffle.";
const ENERGY_TEXT = "{1}, Sacrifice an artifact: You get {E}{E} (two energy counters).";

export default defineCard({
  name: "Maximus, Knight Apparent",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ENTERS_TEXT}\n${ENERGY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Equipment card with mana value 2?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Equipment", manaValue: { op: "eq", n: 2 } },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENERGY_TEXT,
    },
  ],
});
