import { defineCard } from "../define.js";

// EDHREC rank 15240.

const PARTY_MODE =
  "Form a Party — Look at the top five cards of your library. You may reveal any number of creature cards from among them and put them into your hand. Put the rest on the bottom of your library in a random order.";
const BRAWL_MODE = "Start a Brawl — Creatures you control get +2/+2 until end of turn.";

export default defineCard({
  name: "You Meet in a Tavern",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose one —\n• ${PARTY_MODE}\n• ${BRAWL_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: PARTY_MODE,
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 5,
          reveal: "chosen",
          min: 0,
          max: 5,
          filter: { type: "creature" },
          destination: "hand",
          leftover: "bottom-random",
        },
      },
      {
        text: BRAWL_MODE,
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 2,
          toughness: 2,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
