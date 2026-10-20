import { defineCard } from "../define.js";

// EDHREC rank 10240.
//
// Seam Rip's shape: an O-Ring that only exiles if the Hole is still there as
// the trigger resolves (the ruling), and a token exiled this way is gone.
const EXILE_TEXT =
  "When this artifact enters, exile target nonland permanent an opponent controls with mana value 2 or less until this artifact leaves the battlefield.";

export default defineCard({
  name: "Portable Hole",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  text: EXILE_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { notTypes: ["land"], manaValue: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
