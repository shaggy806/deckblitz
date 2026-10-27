import { defineCard } from "../define.js";

export default defineCard({
  name: "Undead Gladiator",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Barbarian"],
  power: 3,
  toughness: 1,
  cycling: { cost: "{1}{B}" },
  text: "{1}{B}, Discard a card: Return this card from your graveyard to your hand. Activate only during your upkeep.\nCycling {1}{B} ({1}{B}, Discard this card: Draw a card.)",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      text: "{1}{B}, Discard a card: Return this card from your graveyard to your hand. Activate only during your upkeep.",
    },
  ],
});
