import { defineCard } from "../define.js";

// EDHREC rank 15826. Zendikar Rising.

const TEXT =
  "Landfall — Whenever a land you control enters, put a +1/+1 counter on this creature. It gains flying until end of turn.";

export default defineCard({
  name: "Fearless Fledgling",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
