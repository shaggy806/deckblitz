import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 20299.
//
// Rulings:
//   [2008-04-01] If Serrated Biskelion leaves the battlefield before its ability resolves, you'll
//     still put a -1/-1 counter on the targeted creature. If the target leaves the battlefield or
//     otherwise becomes an illegal target before the ability resolves, the ability doesn't resolve
//     and you won't put a -1/-1 counter on Serrated Biskelion.
//
// One target, so an illegal one fizzles the whole ability (rule 608.2b); a
// source that has left takes no counter, the target still does.

const TEXT = "{T}: Put a -1/-1 counter on this creature and a -1/-1 counter on target creature.";

export default defineCard({
  name: "Serrated Biskelion",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
          { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
