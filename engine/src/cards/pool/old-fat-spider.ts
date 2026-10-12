import { defineCard } from "../define.js";

export default defineCard({
  name: "Old Fat Spider",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 6,
  toughness: 7,
  keywords: ["reach"],
  text: "Reach\nThis creature can't be blocked by creatures with power 2 or less.\nWhenever this creature becomes the target of a spell or ability an opponent controls, draw a card.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature becomes the target of a spell or ability an opponent controls, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
