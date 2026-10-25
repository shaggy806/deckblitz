import { defineCard } from "../define.js";

export default defineCard({
  name: "Rite of Undoing",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nReturn target nonland permanent you control and target nonland permanent you don't control to their owners' hands.",
  delve: true,
  targets: [
    { kind: "permanent", filter: { notTypes: ["land"], controlledBy: "you" } },
    "nonland-permanent-an-opponent-controls",
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
