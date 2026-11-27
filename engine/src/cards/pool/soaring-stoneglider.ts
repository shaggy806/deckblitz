import { defineCard } from "../define.js";

// SOS. EDHREC rank 26856.
//
// A choice of additional costs (rule 601.2b): exile two cards from your
// graveyard (chosen as the cost is paid, 601.2h) — the option's `also`, as
// Disruption Protocol's tap is — or pay {1}{W} more.

const EXILE = "Exile two cards from your graveyard";

export default defineCard({
  name: "Soaring Stoneglider",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 4,
  toughness: 3,
  text: "As an additional cost to cast this spell, exile two cards from your graveyard or pay {1}{W}.\nFlying, vigilance",
  keywords: ["flying", "vigilance"],
  additionalCost: {
    options: [
      { text: EXILE, also: { text: EXILE, exileFromGraveyard: { count: 2 } } },
      { text: "Pay {1}{W}", mana: "{1}{W}" },
    ],
  },
});
