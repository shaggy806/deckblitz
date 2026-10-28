import { defineCard } from "../define.js";

// Talon Gates of Madara's "put this card from your hand onto the battlefield"
// (an ability of the card in hand, `zone: "hand"`), with Floodbringer's
// return-to-hand cost narrowed to a tapped creature. It still enters tapped:
// its own replacement applies however it enters.
const FROM_HAND =
  "{2}, Return a tapped creature you control to its owner's hand: Put this card from your hand onto the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Urban Retreat",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {G}, {W}, or {U}.\n${FROM_HAND}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G}, {W}, or {U}.",
    },
    {
      cost: {
        mana: "{2}",
        tap: false,
        returnToHand: { count: 1, filter: { type: "creature", tapped: true, controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: FROM_HAND,
      zone: "hand",
      staysInZone: true,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
