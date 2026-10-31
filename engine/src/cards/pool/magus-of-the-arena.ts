import { defineCard } from "../define.js";

// The second target is the activator's, chosen by the opponent they name as
// it's activated (`opponentChoosesTargets`, rules 602.2b, 601.2c): one of
// that opponent's own creatures (`controlledBy: "chooser"`). Both are tapped,
// then they fight; with either target illegal, there's no fight.
const TEXT =
  "{3}, {T}: Tap target creature you control and target creature of an opponent's choice they control. Those creatures fight each other. (Each deals damage equal to its power to the other.)";

export default defineCard({
  name: "Magus of the Arena",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 5,
  toughness: 5,
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
