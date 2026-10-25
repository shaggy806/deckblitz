import { defineCard } from "../define.js";

export default defineCard({
  name: "Endless Obedience",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nPut target creature card from a graveyard onto the battlefield under your control.",
  targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
});
