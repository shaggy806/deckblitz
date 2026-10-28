import { defineCard } from "../define.js";

// EDHREC rank 7580. "A Phyrexian creature or artifact creature spell" is a
// Phyrexian creature spell or any artifact creature spell: the ruling that a
// Phyrexian artifact creature triggers it only once is about the overlap.

const INCUBATE_TEXT =
  "Whenever you cast a Phyrexian creature or artifact creature spell, incubate X, where X is that spell's mana value. (Create an Incubator token with X +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)";
const PROLIFERATE_TEXT =
  "At the beginning of each end step, if a Phyrexian died under your control this turn, proliferate.";

export default defineCard({
  name: "Brimaz, Blight of Oreskos",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cat"],
  power: 3,
  toughness: 4,
  text: `${INCUBATE_TEXT}\n${PROLIFERATE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "creature", anyOf: [{ subtype: "Phyrexian" }, { type: "artifact" }] },
      },
      targets: [],
      effect: { kind: "incubate", amount: { manaValueOf: "trigger-object" } },
      resolve: null,
      text: INCUBATE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "died", who: "you", filter: { subtype: "Phyrexian" } },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: PROLIFERATE_TEXT,
    },
  ],
});
