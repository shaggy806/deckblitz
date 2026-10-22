import { defineCard } from "../define.js";

// EDHREC rank 29026. Amonkhet. Khenra Scrapper's exert, its "when you do" a
// pump.
const EXERT_TEXT = "You may exert this creature as it attacks. When you do, it gets +2/+2 until end of turn.";

export default defineCard({
  name: "Hooded Brawler",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
