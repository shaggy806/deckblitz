import { defineCard } from "../define.js";

const LORD_TEXT = "Golems you control get +1/+1.";

export default defineCard({
  name: "Master Splicer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: `When this creature enters, create a 3/3 colorless Phyrexian Golem artifact creature token.\n${LORD_TEXT}`,
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
      affects: { scope: "creatures-you-control", subtype: "Golem" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
});
