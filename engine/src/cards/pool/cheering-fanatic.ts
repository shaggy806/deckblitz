import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 20178. Anyone's spells with the name, this turn.

const TEXT = "Whenever this creature attacks, choose a card name. Spells with the chosen name cost {1} less to cast this turn.";

export default defineCard({
  name: "Cheering Fanatic",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "choose-card-name",
        aim: "own-hand",
        then: {
          kind: "player-effect",
          duration: "end-of-turn",
          reduceSpells: { applies: { hasName: CHOSEN_CARD_NAME }, reduceGeneric: 1, allCasters: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
