import { defineCard } from "../define.js";

// EDHREC rank 18878.

const TEXT = "When this creature enters, incubate 5.";

export default defineCard({
  name: "Converter Beast",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 0,
  toughness: 1,
  text: `${TEXT} (Create an Incubator token with five +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 5 },
      resolve: null,
      text: TEXT,
    },
  ],
});
