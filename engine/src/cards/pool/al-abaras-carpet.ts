import { defineCard } from "../define.js";

// EDHREC rank 27275.

const TEXT = "{5}, {T}: Prevent all damage that would be dealt to you this turn by attacking creatures without flying.";

export default defineCard({
  name: "Al-abara's Carpet",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: {
        kind: "prevent-damage-to-you",
        by: { type: "creature", attacking: true, notKeyword: "flying" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
