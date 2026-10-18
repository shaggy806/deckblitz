import { defineCard } from "../define.js";

// EDHREC rank 9652.
//
// Rulings:
//   [2023-02-04] The value of X is determined only once, as the triggered ability resolves. If the
//     number of equipped creatures you control changes after that time, it won't change the bonus
//     granted.

// X is read once as the pump applies; "then if Jor Kadeen's power is 4 or
// greater" is checked after it (not an intervening if), reading Jor Kadeen
// as it last existed if it has left.
const ATTACK_TEXT =
  "Whenever Jor Kadeen attacks, it gets +X/+X until end of turn, where X is the number of equipped creatures you control. Then if Jor Kadeen's power is 4 or greater, draw a card.";
const EQUIPPED = { countOf: { type: "creature", controlledBy: "you", equipped: true } } as const;

export default defineCard({
  name: "Jor Kadeen, First Goldwarden",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: EQUIPPED, toughness: EQUIPPED, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { power: { op: "gte", n: 4 } } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
