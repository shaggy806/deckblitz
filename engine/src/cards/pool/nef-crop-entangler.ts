import { defineCard } from "../define.js";

const EXERT_TEXT = "You may exert this creature as it attacks. When you do, it gets +1/+2 until end of turn.";

export default defineCard({
  name: "Nef-Crop Entangler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
