import { defineCard } from "../define.js";

export default defineCard({
  name: "Kaust, Eyes of the Glade",
  manaCost: "{R/W}{G}",
  colors: ["R", "W", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Dryad", "Detective"],
  power: 2,
  toughness: 2,
  text: "Whenever a creature you control that was turned face up this turn deals combat damage to a player, draw a card.\n{T}: Turn target face-down attacking creature you control face up.",
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", turnedFaceUpThisTurn: true },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control that was turned face up this turn deals combat damage to a player, draw a card.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        { kind: "permanent", filter: { type: "creature", faceDown: true, attacking: true, controlledBy: "you" } },
      ],
      effect: { kind: "turn-face-up", target: 0 },
      resolve: null,
      text: "{T}: Turn target face-down attacking creature you control face up.",
    },
  ],
});
