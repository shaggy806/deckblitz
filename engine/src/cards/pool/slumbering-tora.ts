import { defineCard } from "../define.js";

// EDHREC rank 31535.
const TEXT =
  "{2}, Discard a Spirit or Arcane card: This artifact becomes an X/X Cat artifact creature until end of turn, where X is the discarded card's mana value.";

export default defineCard({
  name: "Slumbering Tora",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, discard: { count: 1, filter: { subtypes: ["Spirit", "Arcane"] } } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: { manaValueOf: "discarded" },
        toughness: { manaValueOf: "discarded" },
        addTypes: ["creature"],
        addSubtypes: ["Cat"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
