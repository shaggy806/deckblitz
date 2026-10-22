import { defineCard } from "../define.js";

// EDHREC rank 28303. Glorybringer's exert, its "when you do" a pump.

const EXERT_TEXT = "You may exert this creature as it attacks. When you do, it gets +2/+0 until end of turn.";

export default defineCard({
  name: "Khenra Scrapper",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
