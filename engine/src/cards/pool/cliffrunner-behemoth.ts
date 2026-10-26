import { defineCard } from "../define.js";

const HASTE_TEXT = "This creature has haste as long as you control a red permanent.";
const LIFELINK_TEXT = "This creature has lifelink as long as you control a white permanent.";

export default defineCard({
  name: "Cliffrunner Behemoth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Beast"],
  power: 5,
  toughness: 3,
  text: `${HASTE_TEXT}\n${LIFELINK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      // "A red permanent" — itself included, should it become one.
      condition: { kind: "controls", filter: { colors: ["R"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { colors: ["W"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["lifelink"],
      text: LIFELINK_TEXT,
    },
  ],
});
