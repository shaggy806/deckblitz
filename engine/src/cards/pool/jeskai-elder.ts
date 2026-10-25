import { defineCard } from "../define.js";

// EDHREC rank 18845.
const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const LOOT_TEXT =
  "Whenever this creature deals combat damage to a player, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Jeskai Elder",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 2,
  text: `${PROWESS_TEXT}\n${LOOT_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
