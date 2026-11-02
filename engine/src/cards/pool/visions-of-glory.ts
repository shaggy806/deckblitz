import { defineCard } from "../define.js";

export default defineCard({
  name: "Visions of Glory",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    thisWay: "flashback",
    reduceGeneric: { commanderManaValue: "battlefield-or-command-zone" },
  },
  flashback: { cost: "{8}{W}{W}" },
  text: "Create a 1/1 white Human creature token for each creature you control.\nFlashback {8}{W}{W}. This spell costs {X} less to cast this way, where X is the greatest mana value of a commander you own on the battlefield or in the command zone. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "create-token", token: "Human Token", count: { countOf: { type: "creature", controlledBy: "you" } } },
});
