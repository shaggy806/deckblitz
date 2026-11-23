import { defineCard } from "../define.js";

const TEXT = "{T}: Add {B} or {G}. You get a poison counter.";

export default defineCard({
  name: "Noxious Bayou",
  colors: [],
  types: ["land"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["B", "G"] },
        amount: 1,
        also: { kind: "add-player-counters", counter: "poison", amount: 1, who: "you" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
