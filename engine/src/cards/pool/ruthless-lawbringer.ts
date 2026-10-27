import { defineCard } from "../define.js";

// EDHREC rank 5100. Killmonger, Scourge of Wakanda's shape: the sacrifice
// happens as the trigger resolves, then the reflexive destroy picks its
// target (the ruling).

const TEXT =
  "When this creature enters, you may sacrifice another creature. When you do, destroy target nonland permanent.";

export default defineCard({
  name: "Ruthless Lawbringer",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Assassin"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["nonland-permanent"],
          effect: { kind: "destroy", target: 0 },
          text: "When you do, destroy target nonland permanent.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
