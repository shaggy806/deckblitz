import { defineCard } from "../define.js";

// Rulings: all damage to creatures, not just combat damage; creatures that
// enter later this turn are covered too (the recipient is asked as damage
// would be dealt, rule 615.1), but only those you control now gain hexproof.

export default defineCard({
  name: "Blinding Fog",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to creatures this turn. Creatures you control gain hexproof until end of turn. (They can't be the targets of spells or abilities your opponents control.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-rule", to: { permanents: { type: "creature" } } },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "hexproof",
        duration: "end-of-turn",
      },
    ],
  },
});
