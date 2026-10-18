import { defineCard } from "../define.js";

// EDHREC rank 9647.
// Makes "Phyrexian Golem Token".
//
// Rulings:
//   [2023-02-04] Malcator will count any artifacts that entered the battlefield under your
//     control during the turn, even if you didn't control Malcator at the time. Malcator won't
//     count non-artifact permanents you controlled that became artifacts.
//
// The turn history records each permanent as it entered (`asEntered`), so one that became
// an artifact later isn't counted, and one Malcator wasn't around for is.

const ENTERS_TEXT = "When Malcator enters, create a 3/3 colorless Phyrexian Golem artifact creature token.";
const END_TEXT =
  "At the beginning of your end step, if three or more artifacts entered the battlefield under your control this turn, create a 3/3 colorless Phyrexian Golem artifact creature token.";

export default defineCard({
  name: "Malcator, Purity Overseer",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elephant", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" }, atLeast: 3 },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
