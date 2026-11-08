import { defineCard } from "../define.js";

// "Each Aura and Equipment attached to Valduk": the set attached to the
// source as the ability resolves, as Valduk last existed if it has left
// (rule 608.2h).
const TEXT =
  "At the beginning of combat on your turn, for each Aura and Equipment attached to Valduk, create a 3/1 red Elemental creature token with trample and haste. Exile those tokens at the beginning of the next end step.";

export default defineCard({
  name: "Valduk, Keeper of the Flame",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "3/1 Red Elemental Token",
        count: { aggregate: "count", filter: { subtypes: ["Aura", "Equipment"] }, in: "attached-to-source" },
        exileAtEndStep: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
