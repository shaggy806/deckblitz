import { defineCard } from "../define.js";

export default defineCard({
  name: "Restore",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put target land card from a graveyard onto the battlefield under your control.",
  targets: [{ kind: "card-in-graveyard", filter: { type: "land" } }],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
});
