import { defineCard } from "../define.js";

// Teamwork is a kicker whose cost is tapping creatures (Too Evil to Stay
// Dead's shape): cast with it, the spell has the wider target and the life.

export default defineCard({
  name: "Cruel Alliance",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Teamwork 2 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 2 or more.)\n" +
    "Exile target creature with mana value 3 or less. If this spell was cast using teamwork, instead exile target creature and you gain 3 life.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
  effect: { kind: "exile", target: 0 },
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 2,
    targets: ["creature"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "exile", target: 0 },
        { kind: "gain-life", amount: 3 },
      ],
    },
  },
});
