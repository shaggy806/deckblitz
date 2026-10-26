import { defineCard } from "../define.js";

// Rulings:
//   Nothing happens if there are no nonartifact, nonblack creatures on the battlefield when
//     Nekrataal enters the battlefield, but if there is one, you must target it, even if it's a
//     creature you control.

const ETB = "When this creature enters, destroy target nonartifact, nonblack creature. That creature can't be regenerated.";

export default defineCard({
  name: "Nekrataal",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], notColors: ["B"] } }],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: ETB,
    },
  ],
});
