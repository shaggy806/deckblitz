import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 30203. Glorybringer's exert; its "when you do" a pump
// and first strike for itself.

const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, it gets +1/+0 and gains first strike until end of turn.";

export default defineCard({
  name: "Rhet-Crop Spearmaster",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: `${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
