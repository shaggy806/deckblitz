import { defineCard } from "../define.js";

export default defineCard({
  name: "Wolf Strike",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +2/+0 until end of turn if it's night. Then it deals damage equal to its power to target creature you don't control.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "day-night", is: "night" },
        then: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      },
      // The ruling: it deals the damage even if it's day.
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
