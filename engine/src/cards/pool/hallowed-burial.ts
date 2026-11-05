import { defineCard } from "../define.js";

// EDHREC rank 16488.

export default defineCard({
  name: "Hallowed Burial",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put all creatures on the bottom of their owners' libraries.",
  effect: { kind: "put-on-libraries", what: { all: { type: "creature" } }, position: "bottom" },
});
