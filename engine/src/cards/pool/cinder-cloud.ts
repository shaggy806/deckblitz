import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 28505.
//
// "If a white creature dies this way" is the `this-way` "died" gate with the
// creature's colour as it died; its power and its controller are read as it
// last existed on the battlefield (rule 608.2h).

export default defineCard({
  name: "Cinder Cloud",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target creature. If a white creature dies this way, Cinder Cloud deals damage to that creature's controller equal to the creature's power.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "died", filter: { colors: ["W"] } },
        then: { kind: "damage", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
      },
    ],
  },
});
