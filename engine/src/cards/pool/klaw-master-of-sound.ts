import { defineCard } from "../define.js";

// EDHREC rank 16715.

const PLAY_TEXT = "Whenever you play a card from exile, Klaw gains indestructible until end of turn.";
const DAMAGE_TEXT =
  "Whenever Klaw deals combat damage to a player, look at the top card of that player's library, then exile it face down. You may play it for as long as it remains exiled. Mana of any type can be spent to cast a spell this way.";

export default defineCard({
  name: "Klaw, Master of Sound",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Rogue", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${PLAY_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      // "Play" is a land played or a spell cast (Prosper, Tome-Bound).
      trigger: { on: "plays-card", who: "you", from: "exile" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: PLAY_TEXT,
    },
    {
      // Dream-Thief's Bandana's theft.
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "trigger-player",
        duration: "while-exiled",
        faceDown: true,
        spendAs: "any-type",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
