import { defineCard } from "../define.js";

// EDHREC rank 14196.

export default defineCard({
  name: "Twilight Shepherd",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nWhen this creature enters, return to your hand all cards in your graveyard that were put there from the battlefield this turn.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { putIntoGraveyardThisTurn: { from: ["battlefield"] } },
        destination: "hand",
        count: "all",
      },
      resolve: null,
      text: "When this creature enters, return to your hand all cards in your graveyard that were put there from the battlefield this turn.",
    },
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: "Persist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
    },
  ],
});
