import { defineCard } from "../define.js";

const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, it gets +1/+1 until end of turn and can't be blocked by creatures with power 2 or less this turn.";

// The block restriction is checked as blockers are declared: a bigger blocker
// that shrinks later doesn't unblock it (the ruling, rule 509.1b).
export default defineCard({
  name: "Rhonas's Stalwart",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
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
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "restrict", target: "source", restrictions: [], cantBeBlockedBy: { power: { op: "lte", n: 2 } } },
        ],
      },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
