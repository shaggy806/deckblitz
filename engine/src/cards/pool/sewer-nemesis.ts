import { defineCard } from "../define.js";

// Counted from the chosen player's side: 0/0 once they've left the game (the
// ruling), when their cards have gone with them. Any player can be chosen, its
// controller included.

const CHOOSE = "As this creature enters, choose a player.";
const PT = "Sewer Nemesis's power and toughness are each equal to the number of cards in the chosen player's graveyard.";
const MILL = "Whenever the chosen player casts a spell, that player mills a card.";

export default defineCard({
  name: "Sewer Nemesis",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 0,
  toughness: 0,
  text: `${CHOOSE}\n${PT}\n${MILL}`,
  choosePlayerOnEnter: "player",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        forChosenPlayer: true,
      },
      text: PT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "chosen-player" },
      targets: [],
      effect: { kind: "mill", target: "trigger-controller", amount: 1 },
      resolve: null,
      text: MILL,
    },
  ],
});
