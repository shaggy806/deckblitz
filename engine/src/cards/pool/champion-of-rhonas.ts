import { defineCard } from "../define.js";

// Amonkhet. Glorybringer's exert as it attacks; "when you do" puts a creature
// card from hand onto the battlefield (Elvish Piper's shape) — not attacking,
// since attackers were already declared (the ruling).
const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, you may put a creature card from your hand onto the battlefield.";

export default defineCard({
  name: "Champion of Rhonas",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Jackal", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
      },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
