import { defineCard } from "../define.js";

const BATTALION_TEXT =
  "Battalion — Whenever Tajic and at least two other creatures attack, Tajic gets +5/+5 until end of turn.";

export default defineCard({
  name: "Tajic, Blade of the Legion",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["indestructible"],
  text: `Indestructible\n${BATTALION_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 5, toughness: 5, duration: "end-of-turn" },
      resolve: null,
      text: BATTALION_TEXT,
    },
  ],
});
