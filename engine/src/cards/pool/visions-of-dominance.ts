import { defineCard } from "../define.js";

export default defineCard({
  name: "Visions of Dominance",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    thisWay: "flashback",
    reduceGeneric: { commanderManaValue: "battlefield-or-command-zone" },
  },
  flashback: { cost: "{8}{G}{G}" },
  text: "Put a +1/+1 counter on target creature, then double the number of +1/+1 counters on it.\nFlashback {8}{G}{G}. This spell costs {X} less to cast this way, where X is the greatest mana value of a commander you own on the battlefield or in the command zone. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "double-counters", target: 0, counter: "+1/+1" },
    ],
  },
});
