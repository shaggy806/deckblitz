import { defineCard } from "../define.js";

// Urza's Saga (USG). Both lands go at once; an owner with both of them
// arranges the two on top of their library (rule 401.4).

export default defineCard({
  name: "Plow Under",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put two target lands on top of their owners' libraries.",
  targets: ["land", { kind: "other", of: "land", than: { slots: [0] } }],
  effect: { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" },
});
