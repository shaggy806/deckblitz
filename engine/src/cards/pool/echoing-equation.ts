import { defineCard } from "../define.js";

/** The sorcery back face of Augmenter Pugilist. Loki, Lord of Misrule's copy:
 * only the creatures you control as it resolves, each a copy of the target's
 * copiable values (rule 707.2) until end of turn, not legendary. */
export default defineCard({
  name: "Echoing Equation",
  art: "https://cards.scryfall.io/art_crop/back/d/9/d9131fc3-018a-4975-8795-47be3956160d.jpg",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose target creature you control. Each other creature you control becomes a copy of it until end of turn, except those creatures aren't legendary.",
  targets: ["creature-you-control"],
  effect: {
    kind: "become-copy",
    filter: { type: "creature", controlledBy: "you" },
    exceptOf: true,
    of: 0,
    until: "end-of-turn",
    exceptions: { notLegendary: true },
  },
  faces: ["Augmenter Pugilist", "Echoing Equation"],
});
