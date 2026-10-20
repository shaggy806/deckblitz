import { defineCard } from "../define.js";

const TEXT =
  "{X}, {T}: Exile target creature card with mana value X from a graveyard. Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it. Activate only as a sorcery.";

// X is announced before the target (rule 601.2b–c, via 602.2b), so the
// target filter reads it (`n: "x"`, Tameshi's shape); the token is Berta's.
export default defineCard({
  name: "Sequence Engine",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "any",
          filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "create-token", token: "Fractal Token", count: 1, thenCounters: { kind: "+1/+1", amount: "x" } },
        ],
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
