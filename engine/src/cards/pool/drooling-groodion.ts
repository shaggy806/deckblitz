import { defineCard } from "../define.js";

const TEXT =
  "{2}{B}{G}, Sacrifice a creature: Target creature gets +2/+2 until end of turn. Another target creature gets -2/-2 until end of turn.";

export default defineCard({
  name: "Drooling Groodion",
  manaCost: "{3}{B}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}{G}", tap: false, sacrifice: "creature-you-control" },
      targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: -2, toughness: -2, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
