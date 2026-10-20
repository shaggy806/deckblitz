import { defineCard } from "../define.js";

// EDHREC rank 22576. The cost reduction is Torch Breath's, narrowed to a blue
// permanent the caster doesn't control; the bite is Rabid Gnaw's.

export default defineCard({
  name: "Hunter's Mark",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  cantBeCountered: true,
  text: "This spell costs {3} less to cast if it targets a blue permanent you don't control.\nThis spell can't be countered.\nTarget creature you control gets +1/+1 until end of turn. Then it deals damage equal to its power to target creature or planeswalker you don't control.",
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
  ],
  targetCostReduction: { filter: { colors: ["U"], controlledBy: "opponent" }, reduceGeneric: 3 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
