import { defineCard } from "../define.js";

// EDHREC rank 18648. High-Society Hunter's attack trigger, with an artifact
// as well as a creature to sacrifice and a draw as well as the counter.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature or artifact. If you do, draw a card and put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Beetle-Headed Merchants",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 5,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "artifact"] },
            exceptSource: true,
            text: "Sacrifice another creature or artifact",
          },
        ],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
