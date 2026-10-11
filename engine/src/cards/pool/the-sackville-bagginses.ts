import { defineCard } from "../define.js";

// "You may sacrifice another creature or artifact. If you do, …" is
// Strefan's shape: an `each-player-may` of the controller alone, the option
// offered only with something to sacrifice (rule 118.3), its `ifDid` the
// "if you do". The sacrifice trigger is any token you sacrifice — a
// Treasure for mana as much as a creature token.
const ETB_TEXT =
  "When The Sackville-Bagginses enter, you may sacrifice another creature or artifact. If you do, draw a card and create a Treasure token.";
const SAC_TEXT = "Whenever you sacrifice a token, target opponent loses 1 life.";

export default defineCard({
  name: "The Sackville-Bagginses",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
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
            { kind: "create-token", token: "Treasure Token", count: 1 },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { token: true } },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: 1, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
