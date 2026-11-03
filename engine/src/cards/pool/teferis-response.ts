import { defineCard } from "../define.js";

export default defineCard({
  name: "Teferi's Response",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Counter target spell or ability an opponent controls that targets a land you control. If a permanent's ability is countered this way, destroy that permanent.\n" +
    "Draw two cards.",
  targets: [
    {
      kind: "stack",
      spells: "any",
      abilities: true,
      whose: "opponent",
      targeting: { permanent: { type: "land", controlledBy: "you" } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0, thenSource: { effect: { kind: "destroy", target: 0 } } },
      { kind: "draw", amount: 2 },
    ],
  },
});
