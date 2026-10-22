import { defineCard } from "../define.js";

export default defineCard({
  name: "Tivadar's Crusade",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all Goblins.",
  targets: [],
  effect: { kind: "destroy-all", filter: { subtype: "Goblin" } },
});
