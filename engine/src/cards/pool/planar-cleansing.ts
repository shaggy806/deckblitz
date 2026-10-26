import { defineCard } from "../define.js";

// EDHREC rank 9141.
export default defineCard({
  name: "Planar Cleansing",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all nonland permanents.",
  targets: [],
  effect: { kind: "destroy-all", filter: { notTypes: ["land"] } },
});
