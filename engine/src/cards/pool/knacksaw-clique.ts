import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 16984.
//
// Rulings:
//   {Q} untaps the creature as a cost: it can't be activated while it's untapped, nor (without
//   haste) unless you've controlled it since your most recent turn began.
//   If you don't play the exiled card that turn, it stays exiled and can't be played.
//   It's played with the normal timing rules for its type; a land needs a land drop left.

export default defineCard({
  name: "Knacksaw Clique",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{1}{U}, {Q}: Target opponent exiles the top card of their library. Until end of turn, you may play that card. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false, untap: true },
      targets: ["opponent"],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", whose: 0 },
      resolve: null,
      text: "{1}{U}, {Q}: Target opponent exiles the top card of their library. Until end of turn, you may play that card.",
    },
  ],
});
