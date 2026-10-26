import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 8590.
//
// Fury's divided-damage trigger with "any number of targets": the number of
// targets and the division are chosen as the trigger goes on the stack, each
// target dealt at least 1; damage meant for a target that's illegal on
// resolution is lost (the rulings).
//
// Rulings:
//   [2017-11-17] If some of the creatures or players are illegal targets as Bogardan Hellkite's
//     triggered ability tries to resolve, the original division of damage still applies and the
//     damage that would have been dealt to the illegal targets is lost. It won't be dealt instead
//     to a legal target.
//   [2017-11-17] You choose how many targets Bogardan Hellkite's triggered ability has and how the
//     damage is divided as you put the ability onto the stack. Each target must receive at least 1
//     damage.

const TEXT = "When this creature enters, it deals 5 damage divided as you choose among any number of targets.";

export default defineCard({
  name: "Bogardan Hellkite",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "any-target", max: 5 }],
      divided: { total: 5, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
