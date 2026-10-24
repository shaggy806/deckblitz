import { defineCard } from "../define.js";

// EDHREC rank 14365.
//
// Rulings:
//   [2016-01-22] The last ability checks only Ally creatures you control as the ability resolves.
//     The value of X will be between 0 and 5. Colorless is not a color.
//   [2016-01-22] Once the last ability resolves, the bonus given doesn't change, even if the
//     number of colors among your Allies does.

const ALLIES = { type: "creature", subtype: "Ally", controlledBy: "you" } as const;
const PUMP_TEXT =
  "{W}{U}{B}{R}{G}: Ally creatures you control get +X/+X until end of turn, where X is the number of colors among those creatures.";
const ETB_TEXT =
  "When General Tazri enters, you may search your library for an Ally creature card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "General Tazri",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ally"],
  power: 3,
  toughness: 4,
  text: `${ETB_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      // X is read once, as the ability resolves (rule 608.2h — the rulings).
      effect: {
        kind: "modify-pt-all",
        filter: ALLIES,
        power: { colorsAmong: ALLIES },
        toughness: { colorsAmong: ALLIES },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Ally creature card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Ally", type: "creature" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
