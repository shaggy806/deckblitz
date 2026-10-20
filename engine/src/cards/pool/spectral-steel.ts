import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 10919. Bonebind Orator's graveyard ability:
// `zone: "graveyard"` pays by exiling the card itself.
const PUMP_TEXT = "Enchanted creature gets +2/+2.";
const RETURN_TEXT =
  "{1}{W}, Exile this card from your graveyard: Return another target Aura or Equipment card from your graveyard to your hand.";

export default defineCard({
  name: "Spectral Steel",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: PUMP_TEXT }],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      zone: "graveyard",
      targets: [
        {
          kind: "other",
          of: { kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Aura", "Equipment"] } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
