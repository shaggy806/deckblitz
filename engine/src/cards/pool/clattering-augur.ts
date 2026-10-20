import { defineCard } from "../define.js";

// EDHREC rank 9858. Modern Horizons 2.
export default defineCard({
  name: "Clattering Augur",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Shaman"],
  power: 1,
  toughness: 1,
  text: "This creature can't block.\nWhen this creature enters, you draw a card and you lose 1 life.\n{2}{B}{B}: Return this card from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "{2}{B}{B}: Return this card from your graveyard to your hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, you draw a card and you lose 1 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
