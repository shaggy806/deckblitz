import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 26469. Glorybringer's exert; its "when you do" pumps
// the creatures you control as it resolves.

const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Tah-Crop Elite",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
