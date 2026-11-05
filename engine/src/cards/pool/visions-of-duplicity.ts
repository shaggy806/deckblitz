import { defineCard } from "../define.js";

// Two creatures you don't control trade controllers (rule 701.12b). The
// flashback reduction is the Visions cycle's (Visions of Glory).

const NOT_YOURS = { kind: "permanent", filter: { type: "creature", controlledBy: "opponent" } } as const;

export default defineCard({
  name: "Visions of Duplicity",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{8}{U}{U}" },
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    thisWay: "flashback",
    reduceGeneric: { commanderManaValue: "battlefield-or-command-zone" },
  },
  text: "Exchange control of two target creatures you don't control.\nFlashback {8}{U}{U}. This spell costs {X} less to cast this way, where X is the greatest mana value of a commander you own on the battlefield or in the command zone. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [NOT_YOURS, { kind: "other", of: NOT_YOURS, than: { slot: 0 } }],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
