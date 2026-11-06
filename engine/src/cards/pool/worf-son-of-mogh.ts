import { defineCard } from "../define.js";

const LORD_TEXT = "Other Officers you control get +1/+1.";
const SEEK_TEXT = "Seek out — Whenever you draw your second card each turn, create a 1/1 red Officer creature token.";

export default defineCard({
  name: "Worf, Son of Mogh",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${LORD_TEXT}\n${SEEK_TEXT}`,
  static: [
    { affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Officer" }, grantPt: [1, 1], text: LORD_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 1 },
      resolve: null,
      text: SEEK_TEXT,
    },
  ],
});
