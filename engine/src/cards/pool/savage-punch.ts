import { defineCard } from "../define.js";

// EDHREC rank 13255. Ferocious is read as the spell resolves; the pump comes
// before the fight, and a slot gone illegal skips its own step (the rulings).

export default defineCard({
  name: "Savage Punch",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control fights target creature you don't control.\nFerocious — The creature you control gets +2/+2 until end of turn before it fights if you control a creature with power 4 or greater.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } },
          atLeast: 1,
        },
        then: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
