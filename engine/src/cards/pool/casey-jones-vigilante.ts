import { defineCard } from "../define.js";

// EDHREC rank 18826.
//
// The discard is a delayed triggered ability (rule 603.7) set up as the
// enters ability resolves, at its controller's next upkeep; it happens
// whether or not Casey Jones is still around.

const TEXT =
  "When Casey Jones enters, draw three cards. At the beginning of your next upkeep, discard three cards at random.";

export default defineCard({
  name: "Casey Jones, Vigilante",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          {
            kind: "delayed-trigger",
            at: "your-next-upkeep",
            effect: { kind: "discard", target: "you", amount: 3, random: true },
            text: "Discard three cards at random.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
