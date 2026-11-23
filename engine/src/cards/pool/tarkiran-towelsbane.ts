import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "One or more Rebels … deal combat damage
// to a player": once for each player they hit.

export default defineCard({
  name: "Tarkiran Towelsbane",
  manaCost: "{5}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shark", "Rebel"],
  power: 2,
  toughness: 2,
  text: "When Tarkiran enters, create five 1/1 red Human Rebel creature tokens.\nWhenever one or more Rebels you control deal combat damage to a player, you gain 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Rebel Token", count: 5 },
      resolve: null,
      text: "When Tarkiran enters, create five 1/1 red Human Rebel creature tokens.",
    },
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { subtype: "Rebel" },
        to: "player",
        combat: true,
      },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Whenever one or more Rebels you control deal combat damage to a player, you gain 2 life.",
    },
  ],
});
