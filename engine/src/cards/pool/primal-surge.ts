import { defineCard } from "../define.js";

// EDHREC rank 8065.
//
// Each pass exiles one card and, if it's a permanent card, offers to put it
// onto the battlefield from exile; "if you do, repeat this process" is the
// pass putting something onto the battlefield (an Aura with nothing to
// enchant doesn't enter, so the process ends — the ruling). The entries'
// triggers wait until the spell has finished resolving.

const PERMANENT = { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] } as const;

export default defineCard({
  name: "Primal Surge",
  manaCost: "{8}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Exile the top card of your library. If it's a permanent card, you may put it onto the battlefield. If you do, repeat this process.",
  effect: {
    kind: "repeat",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "exile-from-library", amount: 1 },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "exiled", filter: PERMANENT },
          then: {
            kind: "may",
            prompt: "Put the exiled card onto the battlefield?",
            effect: { kind: "put-exiled-this-way-onto-battlefield" },
          },
        },
      ],
    },
    again: { kind: "this-way", what: "put-onto-battlefield" },
  },
});
