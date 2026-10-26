import { defineCard } from "../define.js";

// "Sacrifice a Homunculus": any Homunculus you control, not only one this made;
// with none, nothing happens (its rulings).
export default defineCard({
  name: "Puppet Conjurer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{U}, {T}: Create a 0/1 blue Homunculus artifact creature token.\nAt the beginning of your upkeep, sacrifice a Homunculus.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Homunculus Token", count: 1 },
      resolve: null,
      text: "{U}, {T}: Create a 0/1 blue Homunculus artifact creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { subtype: "Homunculus" }, count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a Homunculus.",
    },
  ],
});
