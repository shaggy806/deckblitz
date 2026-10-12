import { defineCard } from "../define.js";

export default defineCard({
  name: "Crush",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target noncreature artifact.",
  targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
  effect: { kind: "destroy", target: 0 },
});
