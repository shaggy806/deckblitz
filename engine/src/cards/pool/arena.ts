import { defineCard } from "../define.js";

// As Magus of the Arena: the second target is chosen by the opponent the
// activator names, from among that opponent's own creatures.
const TEXT =
  "{3}, {T}: Tap target creature you control and target creature of an opponent's choice they control. Those creatures fight each other. (Each deals damage equal to its power to the other.)";

export default defineCard({
  name: "Arena",
  colors: [],
  types: ["land"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature-you-control", { kind: "permanent", filter: { type: "creature", controlledBy: "chooser" } }],
      opponentChoosesTargets: [1],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "fight", a: 0, b: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
