import { defineCard } from "../define.js";

export default defineCard({
  name: "Boggart Birth Rite",
  manaCost: "{B}",
  colors: ["B"],
  types: ["kindred", "sorcery"],
  subtypes: ["Goblin"],
  text: "Return target Goblin card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Goblin" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
