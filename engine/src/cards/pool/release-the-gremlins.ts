import { defineCard } from "../define.js";

// Aether Revolt. By Force's "destroy X target artifacts" (exactly X targets,
// so X is capped by the artifacts there are to target — its ruling), then X
// Gremlins: X is the spell's, so a target gone illegal doesn't change the
// tokens, and all of them gone illegal makes nothing (rule 608.2b).
export default defineCard({
  name: "Release the Gremlins",
  manaCost: "{X}{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy X target artifacts. Create X 2/2 red Gremlin creature tokens.",
  targets: [{ kind: "any-number", of: "artifact", min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      { kind: "create-token", token: "2/2 Gremlin Token", count: "x" },
    ],
  },
});
