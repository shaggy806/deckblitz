import { defineCard } from "../define.js";

// "It deals" — the Phoenix, as it last existed on the battlefield, is the
// source of the damage (Plague Spitter's shape: one simultaneous event).
const DIES_TEXT = "When this creature dies, it deals 3 damage to each creature and each player.";
const RETURN_TEXT = "{3}{R}{R}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Magma Phoenix",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{R}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 3 },
          { kind: "damage", amount: 3, who: "each-player" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
