import { defineCard } from "../define.js";

// EDHREC rank 12684.
//
// "Mounts and Vehicles" is any permanent with either subtype (Kolodin,
// Triumph Caster). The attack trigger fires once per attacker.
const HEXPROOF = "During your turn, Mounts and Vehicles you control have hexproof.";
const ATTACK = "Whenever a Mount or Vehicle you control attacks, put a +1/+1 counter on it.";

export default defineCard({
  name: "Miriam, Herd Whisperer",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 2,
  text: `${HEXPROOF}\n${ATTACK}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtypes: ["Mount", "Vehicle"], controlledBy: "you" } },
      condition: { kind: "your-turn" },
      grantKeywords: ["hexproof"],
      text: HEXPROOF,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtypes: ["Mount", "Vehicle"] } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK,
    },
  ],
});
