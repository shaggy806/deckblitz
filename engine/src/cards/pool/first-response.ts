import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of each upkeep, if you lost life last turn, create a 1/1 white Soldier creature token.";

export default defineCard({
  name: "First Response",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      // "Last turn": the turn before this one, whoever's it was (the journal's).
      condition: { kind: "turn-history", what: "life-lost", window: "last-turn", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
