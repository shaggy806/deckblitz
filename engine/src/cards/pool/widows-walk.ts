import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Derelict Attic // Widow's Walk (derelict-attic-widows-walk.ts).
const ALONE = "Whenever a creature you control attacks alone, it gets +1/+0 and gains deathtouch until end of turn.";

export default defineCard({
  name: "Widow's Walk",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${ALONE}\n${ROOM_REMINDER}`,
  triggered: [
    {
      // Exactly one attacker declared (the ruling): exalted's trigger.
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ALONE,
    },
  ],
  faces: ["Derelict Attic // Widow's Walk", "Derelict Attic", "Widow's Walk"],
  split: true,
});
