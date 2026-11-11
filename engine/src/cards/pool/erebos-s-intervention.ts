import { defineCard } from "../define.js";

// Theros Beyond Death (THB). X is announced before the targets are chosen
// (rule 601.2b–c), so the second mode's group holds at most twice the X it's
// cast with — `{ product: ["x", 2] }`, a bound `specsAtX` fixes at that X.
//
// Rulings:
//   If you choose the first mode and the target creature is an illegal target by the time
//     Erebos's Intervention tries to resolve, the spell won't resolve. You won't gain X life.
export default defineCard({
  name: "Erebos's Intervention",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Target creature gets -X/-X until end of turn. You gain X life.\n• Exile up to twice X target cards from graveyards.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature gets -X/-X until end of turn. You gain X life.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt",
              target: 0,
              power: { product: ["x", -1] },
              toughness: { product: ["x", -1] },
              duration: "end-of-turn",
            },
            { kind: "gain-life", amount: "x" },
          ],
        },
      },
      {
        text: "Exile up to twice X target cards from graveyards.",
        targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: { product: ["x", 2] } }],
        effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
      },
    ],
  },
});
