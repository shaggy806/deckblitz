import { defineCard } from "../define.js";

// EDHREC rank 7202. Modern Horizons 3.
//
// One {E} for each creature you control that attacks (the trigger is per
// creature). The six {E} are part of the activation cost (`payEnergy`), paid
// automatically; the token is Ancient Stone Idol's 6/12 trampling Construct.
const ATTACK_TEXT = "Whenever a creature you control attacks, you get {E} (an energy counter).";
const MAKE_TEXT =
  "{T}, Pay six {E}: Create a 6/12 colorless Construct artifact creature token with trample. Activate only as a sorcery.";

export default defineCard({
  name: "Stone Idol Generator",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${ATTACK_TEXT}\n${MAKE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 6 },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "create-token", token: "Construct Token (Ancient Stone Idol)", count: 1 },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
