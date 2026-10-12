import { defineCard } from "../define.js";

// EDHREC rank 7648.
const ALLIANCE_TEXT = "Alliance — Whenever another creature you control enters, Slash deals 2 damage to each opponent.";
const ATTACK_TEXT = "Whenever Slash attacks, create a 2/2 red Mutant creature token.";

export default defineCard({
  name: "Slash, Reptile Rampager",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Berserker", "Turtle"],
  power: 7,
  toughness: 5,
  text: `${ALLIANCE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: ALLIANCE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutant Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
