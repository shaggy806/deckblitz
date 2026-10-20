import { defineCard } from "../define.js";

// Back face of Tribute to Horobi.
//
// "All Rat tokens" is every token with the Rat subtype, whoever controls it
// (yours included, a no-op) — one control-changing effect, lasting
// indefinitely (Hellkite Tyrant's `gain-control-all`, with no controller
// clause).
const ENTER_TEXT = "When this creature enters, gain control of all Rat tokens.";
const ATTACK_TEXT = "Whenever this creature attacks, you may sacrifice another creature. If you do, draw a card.";

export default defineCard({
  name: "Echo of Death's Wail",
  art: "https://cards.scryfall.io/art_crop/back/5/4/54613f38-ca91-4764-b1fe-60cd83707fb4.jpg",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-control-all", filter: { subtype: "Rat", token: true }, untilEndOfTurn: false },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Tribute to Horobi", "Echo of Death's Wail"],
  transform: true,
});
