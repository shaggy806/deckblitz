import { defineCard } from "../define.js";

export default defineCard({
  name: "Diregraf Rebirth",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnHistory: "died", who: "any-player", filter: { type: "creature" } },
  },
  flashback: { cost: "{5}{B}{G}" },
  text: "This spell costs {1} less to cast for each creature that died this turn.\nReturn target creature card from your graveyard to the battlefield.\nFlashback {5}{B}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0 },
});
