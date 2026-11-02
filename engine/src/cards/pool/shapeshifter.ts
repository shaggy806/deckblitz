import { defineCard } from "../define.js";

// A characteristic-defining ability (the ruling; rule 604.3) over the number the
// permanent last chose: the enters choice (`chooseOnEnter`), replaced by an
// upkeep's (`choose-value`'s `remember`). With none chosen, off the battlefield,
// it's 0/7.
const TRIGGER = "At the beginning of your upkeep, you may choose a number between 0 and 7.";
const PT = "Shapeshifter's power is equal to the last chosen number and its toughness is equal to 7 minus that number.";

export default defineCard({
  name: "Shapeshifter",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 7,
  text: `As this creature enters, choose a number between 0 and 7.\n${TRIGGER}\n${PT}`,
  chooseOnEnter: ["0", "1", "2", "3", "4", "5", "6", "7"],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "chosen-number", plusPower: 0, plusToughness: 7, toughnessMinusCount: true },
      text: PT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Choose a new number between 0 and 7?",
        effect: {
          kind: "choose-value",
          value: "number",
          min: 0,
          max: 7,
          remember: true,
          then: { kind: "sequence", effects: [] },
        },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
