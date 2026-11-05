import { defineCard } from "../define.js";

// A Treasure for each artifact the opponents sacrificed this way. The
// flashback reduction is the Visions cycle's (Visions of Glory).

export default defineCard({
  name: "Visions of Ruin",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{8}{R}{R}" },
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    thisWay: "flashback",
    reduceGeneric: { commanderManaValue: "battlefield-or-command-zone" },
  },
  text: "Each opponent sacrifices an artifact. For each artifact sacrificed this way, you create a Treasure token.\nFlashback {8}{R}{R}. This spell costs {X} less to cast this way, where X is the greatest mana value of a commander you own on the battlefield or in the command zone. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-opponent", filter: { type: "artifact" }, count: 1 },
      { kind: "create-token", token: "Treasure Token", count: { thisWay: "sacrificed" } },
    ],
  },
});
