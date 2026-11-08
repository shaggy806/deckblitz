import { defineCard } from "../define.js";

// Zendikar Rising. The two abilities are linked (rule 607.2a): the landfall
// exile is `linked`, the end step reads the cards still in exile with it, so
// one played in response is neither moved nor counted, and "that much" is what
// actually reached a graveyard this way. Left the battlefield before the end
// step, it doesn't trigger, and the exiled cards stay playable (the rulings).

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, exile the top card of your library. You may play that card for as long as it remains exiled.";
const END_TEXT =
  "At the beginning of your end step, if there are cards exiled with this enchantment, put them into their owner's graveyard, then this enchantment deals that much damage to each opponent.";

export default defineCard({
  name: "Valakut Exploration",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${LANDFALL_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "while-exiled", play: true, linked: true },
      resolve: null,
      text: LANDFALL_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "exiled-with-source", atLeast: 1, now: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-exiled-by-source", linked: "graveyard" },
          { kind: "damage", amount: { thisWay: "put-into-graveyard" }, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
