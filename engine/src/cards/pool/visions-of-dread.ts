import { defineCard } from "../define.js";

export default defineCard({
  name: "Visions of Dread",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashback: { cost: "{8}{B}{B}" },
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    thisWay: "flashback",
    reduceGeneric: { commanderManaValue: "battlefield-or-command-zone" },
  },
  text: "Target opponent puts a creature card of their choice from their graveyard onto the battlefield under your control.\nFlashback {8}{B}{B}. This spell costs {X} less to cast this way, where X is the greatest mana value of a commander you own on the battlefield or in the command zone. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["opponent"],
  effect: {
    kind: "for-each-player",
    who: { target: 0 },
    effect: {
      kind: "look-and-choose",
      player: "that-player",
      zone: "graveyard",
      min: 1,
      max: 1,
      filter: { type: "creature" },
      destination: "battlefield",
      under: "you",
      leftover: "stay",
    },
  },
});
