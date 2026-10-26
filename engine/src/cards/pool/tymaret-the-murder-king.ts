import { defineCard } from "../define.js";

// The return works only from the graveyard (`zone: "graveyard"`), so Tymaret
// can't be sacrificed to pay for it (the ruling).
const DAMAGE_TEXT = "{1}{R}, Sacrifice another creature: Tymaret deals 2 damage to target player or planeswalker.";
const RETURN_TEXT = "{1}{B}, Sacrifice a creature: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Tymaret, the Murder King",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${DAMAGE_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: "creature-you-control" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
      otherOnly: true,
    },
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: { filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      zone: "graveyard",
      staysInZone: true,
      text: RETURN_TEXT,
    },
  ],
});
