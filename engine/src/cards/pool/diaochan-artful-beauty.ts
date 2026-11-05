import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// EDHREC rank 19528. The second target is the activator's, chosen by the
// opponent they name as it's activated (`opponentChoosesTargets`, Magus of the
// Arena's shape).

const TEXT =
  "{T}: Destroy target creature of your choice, then destroy target creature of an opponent's choice. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Diaochan, Artful Beauty",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature", "creature"],
      opponentChoosesTargets: [1],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "destroy", target: 1 },
        ],
      },
      condition: BEFORE_ATTACKERS_DECLARED,
      resolve: null,
      text: TEXT,
    },
  ],
});
