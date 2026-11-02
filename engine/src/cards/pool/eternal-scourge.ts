import { defineCard } from "../define.js";

export default defineCard({
  name: "Eternal Scourge",
  manaCost: "{3}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Horror"],
  power: 3,
  toughness: 3,
  text: "You may cast this card from exile.\nWhen this creature becomes the target of a spell or ability an opponent controls, exile this creature.",
  castSelfFromExile: true,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      resolve: null,
      text: "When this creature becomes the target of a spell or ability an opponent controls, exile this creature.",
      targets: [],
      effect: { kind: "exile", target: "source" },
    },
  ],
});
