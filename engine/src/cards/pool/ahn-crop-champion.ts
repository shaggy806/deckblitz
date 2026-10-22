import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 24241. Glorybringer's exert; its "when you do"
// untaps every other creature you control (untapping an attacker doesn't
// remove it from combat — its ruling).

const EXERT_TEXT = "You may exert this creature as it attacks. When you do, untap all other creatures you control.";

export default defineCard({
  name: "Ahn-Crop Champion",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" }, exceptSource: true },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
