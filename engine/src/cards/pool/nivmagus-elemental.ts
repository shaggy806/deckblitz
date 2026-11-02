import { defineCard } from "../define.js";

// Rulings:
//   [2012-10-01] You exile an instant or sorcery spell you control from the stack, not an instant
//     or sorcery card in any other zone.
//   [2012-10-01] Exiling a spell is not the same as countering it, although the spell won't resolve
//     in both cases. You may exile a spell that can't be countered.
//   [2012-10-01] You can exile a copy of an instant or sorcery spell to activate Nivmagus
//     Elemental's ability if you control the copy.

const TEXT =
  "Exile an instant or sorcery spell you control: Put two +1/+1 counters on this creature. (That spell won't resolve.)";

export default defineCard({
  name: "Nivmagus Elemental",
  manaCost: "{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, exileSpell: { filter: { typesAnyOf: ["instant", "sorcery"] } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
