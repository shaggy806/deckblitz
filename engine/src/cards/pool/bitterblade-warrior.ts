import { defineCard } from "../define.js";

// Amonkhet. Khenra Scrapper's exert, its "when you do" a pump and deathtouch.
const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, it gets +1/+0 and gains deathtouch until end of turn.";

export default defineCard({
  name: "Bitterblade Warrior",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Jackal", "Warrior"],
  power: 2,
  toughness: 2,
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
          { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
