import { defineCard } from "../define.js";

// EDHREC rank 16250.
//
// Rulings:
//   [2023-10-13] You may exert Clockwork Droid only as you attack with it. You can't do so later
//     in combat, and creatures put onto the battlefield attacking can't be exerted. The ability
//     that triggers on exerting it will resolve before blockers are declared.
//
// Glorybringer's exert: asked as the attack is declared (rule 508.1g), the
// "when you do" linked to that exert alone.
const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, it can't be blocked this turn and you scry 1. (An exerted creature won't untap during your next untap step. To scry 1, look at the top card of your library. You may put that card on the bottom.)";

export default defineCard({
  name: "Clockwork Droid",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 1,
  text: EXERT_TEXT,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
