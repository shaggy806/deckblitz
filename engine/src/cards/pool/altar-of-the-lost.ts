import { defineCard } from "../define.js";

// Any graveyard (the rulings), and a spell has flashback however it got it: its
// text, Snapcaster Mage's effect, a static's grant it's being cast through.
const ENTER_TEXT = "This artifact enters tapped.";
const MANA_TEXT =
  "{T}: Add two mana in any combination of colors. Spend this mana only to cast spells with flashback from a graveyard.";

export default defineCard({
  name: "Altar of the Lost",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: 2,
        spendOnly: {
          castFrom: { zones: ["graveyard"], withFlashback: true },
          text: "Spend this mana only to cast spells with flashback from a graveyard.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
