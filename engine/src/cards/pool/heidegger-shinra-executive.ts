import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, target creature you control gets +X/+0 until end of turn, where X is the number of Soldiers you control.";
const END_TEXT =
  "At the beginning of your end step, create a number of 1/1 white Soldier creature tokens equal to the number of opponents who control more creatures than you.";

export default defineCard({
  name: "Heidegger, Shinra Executive",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${COMBAT_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { countOf: { subtype: "Soldier", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Soldier Token",
        count: {
          countPlayers: "each-opponent",
          where: {
            kind: "player-compare",
            stat: { controls: { type: "creature" } },
            compare: "fewer",
            than: "that-player",
          },
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
