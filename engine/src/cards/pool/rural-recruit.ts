import { defineCard } from "../define.js";

// EDHREC rank 25964.
//
// Rulings:
//   [2021-11-19] A creature's training ability triggers only when both that creature and a
//     creature with greater power are declared as attackers. Increasing a creature's power after
//     attackers are declared won't cause a training ability to trigger.
//   [2021-11-19] Once a creature's training ability has triggered, destroying the other attacking
//     creature or reducing its power won't stop the creature with training from getting a +1/+1
//     counter.

export default defineCard({
  name: "Rural Recruit",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 1,
  toughness: 1,
  text: "Training (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\nWhen this creature enters, create a 3/1 green Boar creature token.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self", withGreaterPower: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1, training: true },
      resolve: null,
      text: "Training",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Boar Token (Rural Recruit)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 3/1 green Boar creature token.",
    },
  ],
});
