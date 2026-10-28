import { defineCard } from "../define.js";

const TEXT =
  "Whenever Elrond or another creature you control enters, scry 1. If this is the second time this ability has resolved this turn, the Ring tempts you.";

export default defineCard({
  name: "Elrond, Lord of Rivendell",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      // "Elrond or another creature you control" is any creature you control:
      // one ability, so "the second time this ability has resolved" counts
      // Elrond's own entry and the others' together.
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 2 },
            then: { kind: "the-ring-tempts-you" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
