import { defineCard } from "../define.js";

// EDHREC rank 13052.
// Makes Phyrexian Golem → use "Phyrexian Golem Token".
//
// "Whenever you attack" is once per declaration, however many attack
// (Razorkin Hordecaller's trigger).
const ATTACK_TEXT = "Whenever you attack, you get {E} (an energy counter).";
const GOLEM_TEXT =
  "{T}, Pay {E}{E}{E}: Create a 3/3 colorless Phyrexian Golem artifact creature token. Activate only as a sorcery.";

export default defineCard({
  name: "Phyrexian Ironworks",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${ATTACK_TEXT}\n${GOLEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 3 },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: GOLEM_TEXT,
      sorcerySpeed: true,
    },
  ],
});
