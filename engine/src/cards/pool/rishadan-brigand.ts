import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 21855. Each opponent in turn order chooses
// whether to pay {3}; each who doesn't (or can't) sacrifices a permanent of
// their choice.
const ETB_TEXT =
  "When this creature enters, each opponent sacrifices a permanent of their choice unless they pay {3}.";
const BLOCK_TEXT = "This creature can block only creatures with flying.";

export default defineCard({
  name: "Rishadan Brigand",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\n${BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [{ pay: "{3}", text: "Pay {3}" }],
        ifDidnt: { kind: "sacrifice", who: "that-player", filter: {}, count: 1 },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: BLOCK_TEXT,
    },
  ],
});
