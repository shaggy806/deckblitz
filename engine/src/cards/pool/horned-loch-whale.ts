import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 9116. Lagoon Breach is its Adventure.
//
// "Enters tapped unless it's your turn" is Eddymurk Crab's `tappedUnless`
// (its controller's turn), asked as it enters.
const TAPPED_TEXT = "This creature enters tapped unless it's your turn.";

export default defineCard({
  name: "Horned Loch-Whale",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 6,
  toughness: 6,
  keywords: ["flash"],
  text: `Flash\nWard {2}\n${TAPPED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnless: { kind: "your-turn" } },
      text: TAPPED_TEXT,
    },
  ],
  triggered: [ward({ mana: "{2}" })],
  faces: ["Horned Loch-Whale", "Lagoon Breach"],
  adventure: true,
});
