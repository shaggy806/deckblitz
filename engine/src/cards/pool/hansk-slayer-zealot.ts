import { defineCard } from "../define.js";

// EDHREC rank 12921.
// Makes Walker → use "Zombie Token".

export default defineCard({
  name: "Hansk, Slayer Zealot",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 4,
  toughness: 4,
  text: "At the beginning of your upkeep, target opponent creates three Walker tokens. (They're 2/2 black Zombie creatures.)\n{T}: Hansk, Slayer Zealot deals 2 damage to target creature.\nWhenever a Zombie an opponent controls dies, draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{T}: Hansk, Slayer Zealot deals 2 damage to target creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Walker Token", count: 3, who: "target-controller" },
      resolve: null,
      text: "At the beginning of your upkeep, target opponent creates three Walker tokens.",
    },
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", subtype: "Zombie", controlledBy: "opponent" },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a Zombie an opponent controls dies, draw a card.",
    },
  ],
});
