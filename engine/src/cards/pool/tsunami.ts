import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 19220.
export default defineCard({
  name: "Tsunami",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all Islands.",
  effect: { kind: "destroy-all", filter: { subtype: "Island" } },
});
