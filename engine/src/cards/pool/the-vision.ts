import { defineCard } from "../define.js";

// EDHREC rank 7349.
//
// Monument to Endurance's shape: a modal trigger whose mode is announced as it
// goes on the stack, each mode usable once a turn.

const TRIGGER_TEXT = "Whenever you cast a noncreature spell, choose one that hasn't been chosen this turn —";
const SOLAR_BEAM = "• Solar Beam — The Vision gains double strike until end of turn.";
const DENSITY_CONTROL = "• Density Control — The Vision gains indestructible until end of turn.";
const TECHNOPATHY = "• Technopathy — Draw a card.";

export default defineCard({
  name: "The Vision",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Hero"],
  power: 2,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TRIGGER_TEXT}\n${SOLAR_BEAM}\n${DENSITY_CONTROL}\n${TECHNOPATHY}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenThisTurn: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: SOLAR_BEAM,
            effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
          },
          {
            text: DENSITY_CONTROL,
            effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          },
          { text: TECHNOPATHY, effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${SOLAR_BEAM} ${DENSITY_CONTROL} ${TECHNOPATHY}`,
    },
  ],
});
