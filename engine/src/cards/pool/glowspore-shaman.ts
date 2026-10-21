import { defineCard } from "../define.js";

// EDHREC rank 10119. Guilds of Ravnica. The land put back is chosen from the
// whole graveyard, not only the milled cards (the ruling), and isn't targeted.

const ETB_TEXT =
  "When this creature enters, mill three cards. You may put a land card from your graveyard on top of your library.";

export default defineCard({
  name: "Glowspore Shaman",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 3,
  toughness: 1,
  text: `${ETB_TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            filter: { type: "land" },
            destination: "library-top",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
