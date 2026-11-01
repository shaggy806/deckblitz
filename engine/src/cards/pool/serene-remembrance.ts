import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). The spell goes into its owner's library with
// the targets, and each library that got a card is shuffled. Cast with no
// targets, it shuffles itself in alone.

export default defineCard({
  name: "Serene Remembrance",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Shuffle Serene Remembrance and up to three target cards from a single graveyard into their owners' libraries.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 3, sameController: true }],
  effect: { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "shuffle", withSource: true },
});
