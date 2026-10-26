import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 15010. Tsunami at instant speed.

export default defineCard({
  name: "Boil",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy all Islands.",
  targets: [],
  effect: { kind: "destroy-all", filter: { subtype: "Island" } },
});
