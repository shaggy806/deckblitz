import { defineCard } from "../define.js";

// The +5/+0 only if a creature was dealt the damage — not a player, and not
// when it was prevented (rule 615.1).
export default defineCard({
  name: "Provoke the Trolls",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Provoke the Trolls deals 3 damage to any target. If a creature is dealt " +
    "damage this way, it gets +5/+0 until end of turn.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "damage-dealt-this-way", to: 0 },
            { kind: "target", index: 0, filter: { type: "creature" } },
          ],
        },
        then: { kind: "modify-pt", target: 0, power: 5, toughness: 0, duration: "end-of-turn" },
      },
    ],
  },
});
