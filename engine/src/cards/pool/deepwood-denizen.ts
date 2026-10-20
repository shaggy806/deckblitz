import { defineCard } from "../define.js";

const DRAW =
  "{5}{G}, {T}: Draw a card. This ability costs {1} less to activate for each +1/+1 counter on creatures you control.";

export default defineCard({
  name: "Deepwood Denizen",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${DRAW}`,
  activated: [
    {
      cost: { mana: "{5}{G}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      // Every +1/+1 counter on every creature you control; generic mana only,
      // so never below {G}.
      costReduction: {
        reduceGeneric: {
          aggregate: "sum",
          of: { counters: "+1/+1" },
          filter: { type: "creature", controlledBy: "you" },
        },
      },
      resolve: null,
      text: DRAW,
    },
  ],
});
