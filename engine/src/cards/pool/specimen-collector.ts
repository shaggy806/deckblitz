import { defineCard } from "../define.js";

// The dies trigger may copy any token you control, not only the ones it made
// and not only a creature (its ruling).
const ENTERS_TEXT =
  "When this creature enters, create a 1/1 green Squirrel creature token and a 0/3 blue Crab creature token.";
const DIES_TEXT = "When this creature dies, create a token that's a copy of target token you control.";

export default defineCard({
  name: "Specimen Collector",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "create-token", token: "Squirrel Token", count: 1 },
          { kind: "create-token", token: "Crab Token", count: 1 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { token: true } }],
      effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
