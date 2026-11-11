import { defineCard } from "../define.js";

// Still a counter: a spell that can't be countered resolves. The card that
// enters is a new object (rule 400.7) that nobody cast: unkicked, its X 0.
export default defineCard({
  name: "Desertion",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If an artifact or creature spell is countered this way, put that card onto the battlefield under your control instead of into its owner's graveyard.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0, into: "battlefield", intoIf: { typesAnyOf: ["artifact", "creature"] } },
});
