import { defineCard } from "../define.js";

// EDHREC rank 27595.

const ENTER_TEXT =
  "When this enchantment enters, reveal the top five cards of your library. Put a land card from among them onto the battlefield tapped and the rest into your graveyard.";

export default defineCard({
  name: "Hit It!",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: `Creatures you control have haste.\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "graveyard",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["haste"],
      text: "Creatures you control have haste.",
    },
  ],
});
