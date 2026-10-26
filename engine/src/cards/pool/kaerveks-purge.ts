import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 28113.
//
// Kalitas, Bloodchief of Ghet's shape: "dies this way" is `this-way: died`
// (indestructible or a regeneration deals nothing), and the creature's power
// and controller are read as it last existed on the battlefield (rule 608.2h).

const TEXT =
  "Destroy target creature with mana value X. If that creature dies this way, Kaervek's Purge deals damage equal to the creature's power to the creature's controller.";

export default defineCard({
  name: "Kaervek's Purge",
  manaCost: "{X}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "eq", n: "x" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "died" },
        then: { kind: "damage", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
      },
    ],
  },
});
