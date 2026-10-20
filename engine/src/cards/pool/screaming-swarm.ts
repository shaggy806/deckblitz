import { defineCard } from "../define.js";

// EDHREC rank 17777.
//
// Rulings:
//   [2021-11-19] You may target yourself with Screaming Swarm's triggered ability.
//
// Rabble-Rousing's batched attack trigger: once per declaration, its value
// the number of creatures attacking. The graveyard ability puts the card
// itself second from the top (Abzan Devotee's graveyard activation).

const ATTACK_TEXT =
  "Whenever you attack with one or more creatures, target player mills that many cards.";
const RECUR_TEXT = "{2}{U}: Put this card from your graveyard into your library second from the top.";

export default defineCard({
  name: "Screaming Swarm",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT} (To mill a card, a player puts the top card of their library into their graveyard.)\n${RECUR_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-on-library", target: "source", position: { fromTop: 2 } },
      resolve: null,
      text: RECUR_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { type: "creature" } },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: { triggerValue: true } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
