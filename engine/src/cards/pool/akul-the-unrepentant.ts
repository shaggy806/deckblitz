import { defineCard } from "../define.js";

// EDHREC rank 11407.
//
// "Sacrifice three other creatures" (Teysa, Orzhov Scion's count, kept off
// Akul by `otherOnly`) — chosen as the cost is paid; then Elvish Piper's
// optional put from the hand.
const PUT_TEXT =
  "Sacrifice three other creatures: You may put a creature card from your hand onto the battlefield. Activate only as a sorcery and only once each turn.";

export default defineCard({
  name: "Akul the Unrepentant",
  manaCost: "{B}{B}{R}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Scorpion", "Dragon", "Rogue"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${PUT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" }, count: 3 } },
      otherOnly: true,
      sorcerySpeed: true,
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
      },
      resolve: null,
      text: PUT_TEXT,
    },
  ],
});
