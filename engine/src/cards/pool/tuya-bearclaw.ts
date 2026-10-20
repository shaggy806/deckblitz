import { defineCard } from "../define.js";

// EDHREC rank 10729.
//
// Rulings:
//   [2020-11-10] The value of X is calculated as Tuya Bearclaw's ability resolves. If you control
//     no other creatures at that time or if the greatest power among other creatures you control
//     is 0 or less, X will be 0.
//   [2020-11-10] Once the ability resolves and the bonus is applied, that bonus won't change,
//     even if the greatest power among other creatures you control does.
//
// Read once as it resolves; a `modify-pt` amount is clamped at 0 (rule 107.1b).

const TEXT =
  "Whenever Tuya Bearclaw attacks, it gets +X/+X until end of turn, where X is the greatest power among other creatures you control.";
const X = {
  aggregate: "max",
  of: "power",
  filter: { type: "creature", controlledBy: "you" },
  excludeSelf: true,
} as const;

export default defineCard({
  name: "Tuya Bearclaw",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: X, toughness: X, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
