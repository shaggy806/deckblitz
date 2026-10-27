import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 25628.
//
// Rulings:
//   [2021-03-19] Pendelhaven Elder's ability looks at each creature's actual power and toughness
//     taking into account counters and effects that raise or lower its power and/or toughness, not
//     just its base power and toughness.
//   [2021-03-19] Pendelhaven Elder's ability affects only 1/1 creatures you control at the time it
//     resolves. Creatures you begin to control later in the turn or that become 1/1 later in the
//     turn won't get +1/+2.
//
// Moonveil Dragon's modify-pt-all (the set locked as it resolves, rule
// 611.2c) over Lovestruck Beast's 1/1 filter.

const TEXT = "{T}: Each 1/1 creature you control gets +1/+2 until end of turn.";

export default defineCard({
  name: "Pendelhaven Elder",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: {
          type: "creature",
          controlledBy: "you",
          power: { op: "eq", n: 1 },
          toughness: { op: "eq", n: 1 },
        },
        power: 1,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
