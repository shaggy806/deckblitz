import { defineCard } from "../define.js";

// Avacyn Restored (AVR). Any player's instant or sorcery spell, read as it is
// on the stack (the trigger's `spellFilter`).

const TEXT =
  "Whenever a creature you control becomes the target of an instant or sorcery spell, that creature gets +3/+3 until end of turn.";

export default defineCard({
  name: "Wild Defiance",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "you-control",
        filter: { type: "creature" },
        spellFilter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
