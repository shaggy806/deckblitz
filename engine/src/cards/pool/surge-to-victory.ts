import { defineCard } from "../define.js";

export default defineCard({
  name: "Surge to Victory",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  text: "Exile target instant or sorcery card from your graveyard. Creatures you control get +X/+0 until end of turn, where X is that card's mana value. Whenever a creature you control deals combat damage to a player this turn, copy the exiled card. You may cast the copy without paying its mana cost.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { manaValueOf: 0 },
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "delayed-trigger",
        about: "exiled",
        at: { whenever: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } } },
        effect: { kind: "cast-now", from: "targets", copies: 1, free: true },
        text: "Whenever a creature you control deals combat damage to a player this turn, copy the exiled card. You may cast the copy without paying its mana cost.",
      },
    ],
  },
});
