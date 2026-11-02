import { defineCard } from "../define.js";

// A secret `vote` of `for: { number }` — any number 0 or greater: you can't
// choose a negative one (rule 107.1b).
const TEXT =
  "When this creature enters, each player secretly chooses a number. Then those numbers are revealed. " +
  "Each player with the highest number loses that much life. " +
  "If you are one of those players, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Menacing Ogre",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 3,
  toughness: 3,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", choose: true, secret: true, for: { number: {} } },
          {
            kind: "for-each-player",
            who: "each-player",
            whoIf: { kind: "voted-number", who: "that-player", is: "highest" },
            simultaneous: true,
            effect: { kind: "lose-life", amount: { votedNumber: "highest" }, who: "that-player" },
          },
          {
            kind: "conditional",
            condition: { kind: "voted-number", who: "you", is: "highest" },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
