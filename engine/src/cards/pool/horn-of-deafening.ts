import { defineCard } from "../define.js";

// EDHREC rank 26888.

export default defineCard({
  name: "Horn of Deafening",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Prevent all combat damage that would be dealt by target creature this turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
      resolve: null,
      text: "{2}, {T}: Prevent all combat damage that would be dealt by target creature this turn.",
    },
  ],
});
