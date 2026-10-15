import { defineCard } from "../define.js";

// EDHREC rank 31594.

const VIGILANCE_TEXT = "This creature has vigilance as long as you control a Jace planeswalker.";
const ENTER_TEXT = "When this creature enters, it fights up to one target creature an opponent controls.";

export default defineCard({
  name: "Mind Meanderer",
  manaCost: "{3}{G}{U}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Bird", "Fish", "Illusion"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${VIGILANCE_TEXT}\n${ENTER_TEXT} (Each deals damage equal to its power to the other.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Jace" }, atLeast: 1 },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
