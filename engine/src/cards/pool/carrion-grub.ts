import { defineCard } from "../define.js";

// EDHREC rank 10894.

const PUMP_TEXT = "This creature gets +X/+0, where X is the greatest power among creature cards in your graveyard.";
const ENTER_TEXT = "When this creature enters, mill four cards.";

export default defineCard({
  name: "Carrion Grub",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 5,
  text: `${PUMP_TEXT}\nWhen this creature enters, mill four cards. (Put the top four cards of your library into your graveyard.)`,
  static: [
    {
      // On the battlefield only (the ruling); a card's power in a graveyard
      // is its printed one, counters and until-end-of-turn effects gone.
      affects: { scope: "self" },
      grantPtPerCount: {
        aggregate: {
          aggregate: "max",
          of: "power",
          filter: { type: "creature", ownedBy: "you" },
          in: "graveyards",
        },
        pt: [1, 0],
      },
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 4 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
