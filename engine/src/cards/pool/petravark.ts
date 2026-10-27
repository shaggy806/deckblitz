import { defineCard } from "../define.js";

// Torment. EDHREC rank 28371. Journey to Nowhere's two-trigger exile (rule
// 607.2a), aimed at a land.

const ENTER_TEXT = "When this creature enters, exile target land.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Petravark",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Nightmare", "Beast"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
