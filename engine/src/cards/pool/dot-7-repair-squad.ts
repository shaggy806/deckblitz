import { defineCard } from "../define.js";

// EDHREC rank 31591.

const UNTAP_TEXT = "{1}{W}: Untap target creature. Activate only as a sorcery and only once each turn.";

export default defineCard({
  name: "DOT-7 Repair Squad",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: UNTAP_TEXT,
      sorcerySpeed: true,
      oncePerTurn: true,
    },
  ],
});
