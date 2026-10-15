import { defineCard } from "../define.js";

// EDHREC rank 26245.
//
// "Another artifact": a static's `controls` scan skips its own source, so
// this one never counts itself. The search finds a card by name, entering
// tapped (Rampant Growth's shape).

const PUMP_TEXT = "This creature gets +1/+0 as long as you control another artifact.";
const SEARCH_TEXT =
  "{2}{W}: Search your library for a card named Magitek Infantry, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Magitek Infantry",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${PUMP_TEXT}\n${SEARCH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantPt: [1, 0],
      text: PUMP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Magitek Infantry" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
