import { defineCard } from "../define.js";

// Kicker—Sacrifice an artifact or Goblin (rule 702.33a): `also.sacrifice`
// over "artifact or Goblin". Kicked, the spell has a second target, chosen
// only then (the kicked variant's `targets`).

export default defineCard({
  name: "Goblin Barrage",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker—Sacrifice an artifact or Goblin. (You may sacrifice an artifact or Goblin in addition to any other costs as you cast this spell.)\nGoblin Barrage deals 4 damage to target creature. If this spell was kicked, it also deals 4 damage to target player or planeswalker.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: 4 },
  kicker: {
    cost: "",
    also: {
      text: "Sacrifice an artifact or Goblin",
      sacrifice: { filter: { anyOf: [{ type: "artifact" }, { subtype: "Goblin" }] }, count: 1 },
    },
    targets: ["creature", "player-or-planeswalker"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage", target: 0, amount: 4 },
        { kind: "damage", target: 1, amount: 4 },
      ],
    },
  },
});
