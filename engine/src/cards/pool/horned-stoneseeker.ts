import { defineCard } from "../define.js";

// EDHREC rank 23361.
//
// Rulings:
//   [2022-10-14] Although all the cards in The Brothers' War that create Powerstone tokens create
//     a tapped Powerstone token, entering the battlefield tapped isn't part of the token's
//     definition.
//
// "Sacrifice a Powerstone" is any Powerstone you control, not only the one it
// made (Molten Man's leave-the-battlefield sacrifice, by subtype).
const ETB_TEXT = "When this creature enters, create a tapped Powerstone token.";
const LEAVE_TEXT = "When this creature leaves the battlefield, sacrifice a Powerstone.";

export default defineCard({
  name: "Horned Stoneseeker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${ETB_TEXT} (It's an artifact with "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { subtype: "Powerstone" }, count: 1 },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
