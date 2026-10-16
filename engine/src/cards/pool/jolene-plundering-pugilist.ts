import { defineCard } from "../define.js";

// EDHREC rank 9633.
//
// "Whenever you attack with one or more creatures with power 4 or greater":
// one trigger per attack declaration, however many such attackers.
const ATTACK_TEXT = "Whenever you attack with one or more creatures with power 4 or greater, create a Treasure token.";
const PING_TEXT = "{1}{R}, Sacrifice a Treasure: Jolene deals 1 damage to any target.";

export default defineCard({
  name: "Jolene, Plundering Pugilist",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 4,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { type: "creature", power: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: { filter: { subtype: "Treasure" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
