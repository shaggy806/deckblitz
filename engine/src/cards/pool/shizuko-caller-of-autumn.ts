import { defineCard } from "../define.js";

const UPKEEP =
  "At the beginning of each player's upkeep, that player adds {G}{G}{G}. Until end of turn, they don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Shizuko, Caller of Autumn",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Shaman"],
  power: 2,
  toughness: 3,
  text: UPKEEP,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 3, who: "active-player", persists: true },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
