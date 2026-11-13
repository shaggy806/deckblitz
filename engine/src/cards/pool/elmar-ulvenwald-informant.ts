import { defineCard } from "../define.js";

// EDHREC rank 13275.

export default defineCard({
  name: "Elmar, Ulvenwald Informant",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  pairing: { kind: "partner-group", group: "Friends forever" },
  text: "Haste\nWhenever you cast your second spell each turn, untap target creature, then investigate. (Create a colorless Clue artifact token with \"{2}, Sacrifice this artifact: Draw a card.\")\nPartner—Friends forever (You can have two commanders if both have this ability.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "create-token", token: "Clue Token", investigate: true, count: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you cast your second spell each turn, untap target creature, then investigate.",
    },
  ],
});
