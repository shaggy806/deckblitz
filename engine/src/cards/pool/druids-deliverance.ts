import { defineCard } from "../define.js";

// EDHREC rank 3946.
// Rulings:
//   [2017-03-14] Combat damage dealt to creatures or planeswalkers you control won't be prevented.
//   [2024-01-12] If you control no creature tokens when you populate, nothing will happen.
//
// Only combat damage to you the player (`players: "you"`, no permanents).

export default defineCard({
  name: "Druid's Deliverance",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt to you this turn. Populate. (Create a token that's a copy of a creature token you control.)",
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage-rule", to: { players: "you" }, combat: true }, { kind: "populate" }],
  },
});
