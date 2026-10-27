import { defineCard } from "../define.js";

const THRESHOLD_TEXT =
  "Threshold — This creature gets +1/+1 for each black permanent your opponents control as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Nantuko Blightcutter",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 2,
  toughness: 2,
  text: `Protection from black\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPtPerCount: { filter: { colors: ["B"], controlledBy: "opponent" }, pt: [1, 1] },
      text: THRESHOLD_TEXT,
    },
  ],
});
