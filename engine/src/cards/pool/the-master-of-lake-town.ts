import { defineCard } from "../define.js";

const MILL = "Whenever a player loses life, that player mills that many cards. (Damage causes loss of life.)";
const DRAW = "When The Master of Lake-town dies, draw a card for each graveyard with seven or more cards in it.";

export default defineCard({
  name: "The Master of Lake-town",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${MILL}\n${DRAW}`,
  triggered: [
    {
      trigger: { on: "loses-life", who: "any" },
      targets: [],
      effect: { kind: "mill", target: "trigger-player", amount: { triggerValue: true } },
      resolve: null,
      text: MILL,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "draw",
        amount: {
          countPlayers: "each-player",
          where: { kind: "of-player", player: "that-player", condition: { kind: "cards-in-graveyard", atLeast: 7 } },
        },
      },
      resolve: null,
      text: DRAW,
    },
  ],
});
