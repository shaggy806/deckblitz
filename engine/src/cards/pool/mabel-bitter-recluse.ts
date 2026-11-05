import { defineCard } from "../define.js";

// EDHREC rank 26821.
//
// The counters are the controller's choice of kinds, picked as the trigger
// resolves (`remove-counters`, `counter: "any"`, up to three).
const TEXT = "When Mabel enters, remove up to three counters from another target creature or planeswalker.";

export default defineCard({
  name: "Mabel, Bitter Recluse",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mouse", "Warlock"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
      ],
      effect: { kind: "remove-counters", target: 0, counter: "any", count: 3, upTo: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
