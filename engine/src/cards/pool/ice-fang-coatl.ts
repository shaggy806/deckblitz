import { defineCard } from "../define.js";

const DEATHTOUCH = "This creature has deathtouch as long as you control at least three other snow permanents.";

export default defineCard({
  name: "Ice-Fang Coatl",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\nWhen this creature enters, draw a card.\n${DEATHTOUCH}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      // A static's condition leaves its own permanent out: "three other".
      condition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 3 },
      grantKeywords: ["deathtouch"],
      text: DEATHTOUCH,
    },
  ],
});
