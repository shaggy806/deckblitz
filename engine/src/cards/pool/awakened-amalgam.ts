import { defineCard } from "../define.js";

const PT_TEXT =
  "Awakened Amalgam's power and toughness are each equal to the number of differently named lands you control.";

// A characteristic-defining ability (rule 604.3), so it works in every zone.
// Names aren't changed by the layers that compute power, so reading other
// lands' names has no dependency problem.
export default defineCard({
  name: "Awakened Amalgam",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
