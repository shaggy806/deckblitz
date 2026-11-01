import { defineCard } from "../define.js";

// Up to six creature cards, no two sharing a name (`differentNames`), onto the
// battlefield together (rule 603.6a).
export default defineCard({
  name: "Behold the Sinister Six!",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to six target creature cards with different names from your graveyard to the battlefield.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      max: 6,
      differentNames: true,
    },
  ],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "put-onto-battlefield", target: 0 } },
});
