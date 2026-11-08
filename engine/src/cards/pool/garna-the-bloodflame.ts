import { defineCard } from "../define.js";

const RETURN_TEXT =
  "When Garna enters, return to your hand all creature cards in your graveyard that were put there from anywhere this turn.";
const HASTE_TEXT = "Other creatures you control have haste.";

export default defineCard({
  name: "Garna, the Bloodflame",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${RETURN_TEXT}\n${HASTE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { type: "creature", putIntoGraveyardThisTurn: {} },
        destination: "hand",
        count: "all",
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  static: [{ affects: { scope: "creatures-you-control", excludeSelf: true }, grantKeywords: ["haste"], text: HASTE_TEXT }],
});
