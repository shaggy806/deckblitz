import { defineCard } from "../define.js";

export default defineCard({
  name: "Clear Shot",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +1/+1 until end of turn. It deals damage equal to its power to target creature you don't control.",
  targets: ["creature-you-control", { kind: "permanent", filter: { type: "creature", controlledBy: "opponent" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
