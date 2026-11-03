import { defineCard } from "../define.js";
import { CHOSEN_CREATURE_TYPE, LAND_TYPES } from "../helpers.js";

// EDHREC rank 31369.
//
// Rulings:
//   Can't give Snow landwalk, because Snow is supertype, not a subtype.
//   Can only give landwalk of land sub-types that exist (rule 205.3i).

const LANDWALK_TEXT =
  "At the beginning of your upkeep, choose a land type. This creature gains landwalk of the chosen type until end of turn.";

export default defineCard({
  name: "Illusionary Presence",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  text: `Cumulative upkeep {U} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${LANDWALK_TEXT} (It can't be blocked as long as defending player controls a land of that type.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "age", amount: 1 },
            {
              kind: "unless",
              chooser: "you",
              options: [
                {
                  pay: "{U}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {U} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: "Cumulative upkeep {U}",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        options: LAND_TYPES,
        prompt: "Choose a land type",
        then: {
          kind: "grant-static",
          target: "source",
          ability: {
            affects: { scope: "self" },
            landwalk: { type: "land", subtype: CHOSEN_CREATURE_TYPE },
            text: "This creature has landwalk of the chosen type.",
          },
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: LANDWALK_TEXT,
    },
  ],
});
