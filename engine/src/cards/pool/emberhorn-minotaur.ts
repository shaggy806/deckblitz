import { defineCard } from "../define.js";

const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, it gets +1/+1 and gains menace until end of turn.";

export default defineCard({
  name: "Emberhorn Minotaur",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 4,
  toughness: 3,
  text: `${EXERT_TEXT} (An exerted creature won't untap during your next untap step. A creature with menace can't be blocked except by two or more creatures.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
