import { defineCard } from "../define.js";

const TEXT =
  "{1}, {T}: This creature deals X damage to any target, where X is the number of permanents you've sacrificed this turn.";

export default defineCard({
  name: "Pyre-Sledge Arsonist",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { turnHistory: "sacrificed", who: "you" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
