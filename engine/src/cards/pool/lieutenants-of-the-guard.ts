import { defineCard } from "../define.js";

const TEXT =
  "Council's dilemma — When this creature enters, starting with you, each player votes for strength or numbers. Put a +1/+1 counter on this creature for each strength vote and create a 1/1 white Soldier creature token for each numbers vote.";

export default defineCard({
  name: "Lieutenants of the Guard",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["strength", "numbers"] } },
          {
            kind: "for-each-vote",
            option: 0,
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
          { kind: "for-each-vote", option: 1, effect: { kind: "create-token", token: "Soldier Token", count: 1 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
