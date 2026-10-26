import { defineCard } from "../define.js";

// Portal Three Kingdoms (PTK). EDHREC rank 11729.

export default defineCard({
  name: "Ravages of War",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all lands.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "land" } },
});
