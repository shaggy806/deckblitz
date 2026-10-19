import { defineCard } from "../define.js";

// Streets of New Capenna. The permanent's owner picks top or bottom (its
// ruling says the controller; the Oracle text and Riverwalk Technique say the
// owner, whose library it goes to).

export default defineCard({
  name: "Run Out of Town",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "The owner of target nonland permanent puts it on their choice of the top or bottom of their library.",
  targets: ["nonland-permanent"],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
