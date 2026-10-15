import { defineCard } from "../define.js";

// EDHREC rank 9195. Surrak and Goreclaw's shape over Avatar Enthusiasts'
// "another Ally you control" trigger.
const ALLY_TEXT =
  "Whenever another Ally you control enters, put a +1/+1 counter on that creature and it gains haste until end of turn.";

export default defineCard({
  name: "Wartime Protestors",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ALLY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ALLY_TEXT,
    },
  ],
});
