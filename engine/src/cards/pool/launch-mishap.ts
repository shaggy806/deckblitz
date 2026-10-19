import { defineCard } from "../define.js";

// EDHREC rank 13901.
//
// The Thopter comes whether or not the counter succeeds, so long as the
// spell resolves — it doesn't if its one target is gone (rule 608.2b).

export default defineCard({
  name: "Launch Mishap",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or planeswalker spell. Create a 1/1 colorless Thopter artifact creature token with flying.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "create-token", token: "Thopter Token", count: 1 },
    ],
  },
});
