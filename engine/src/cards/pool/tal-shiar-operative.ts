import { defineCard } from "../define.js";

const DEATHTOUCH_MODE = "Target creature you control gains deathtouch until end of turn.";
const SURVEIL_MODE = "Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)";

export default defineCard({
  name: "Tal Shiar Operative",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Romulan", "Officer", "Spy"],
  power: 2,
  toughness: 2,
  text: `Whenever this creature attacks, choose one —\n• ${DEATHTOUCH_MODE}\n• ${SURVEIL_MODE}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: DEATHTOUCH_MODE,
            targets: ["creature-you-control"],
            effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          },
          { text: SURVEIL_MODE, effect: { kind: "surveil", amount: 1 } },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, choose one —",
    },
  ],
});
