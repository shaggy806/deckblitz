import { defineCard } from "../define.js";

// EDHREC rank 10221.

export default defineCard({
  name: "Sensor Splicer",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Artificer"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, create a 3/3 colorless Phyrexian Golem artifact creature token.\nGolem creatures you control have vigilance.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 3/3 colorless Phyrexian Golem artifact creature token.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Golem", controlledBy: "you" } },
      grantKeywords: ["vigilance"],
      text: "Golem creatures you control have vigilance.",
    },
  ],
});
