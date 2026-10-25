import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 26456.

const RETURN_TEXT =
  "{2}{R}{R}{R}: Return this card from your graveyard to your hand. Activate only during your upkeep.";

export default defineCard({
  name: "Hammer of Bogardan",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Hammer of Bogardan deals 3 damage to any target.\n${RETURN_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  activated: [
    {
      cost: { mana: "{2}{R}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
