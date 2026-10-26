import { defineCard } from "../define.js";

export default defineCard({
  name: "Hostility",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 6,
  toughness: 6,
  keywords: ["haste"],
  text: "Haste\nIf a spell you control would deal damage to an opponent, prevent that damage. Create a 3/1 red Elemental Shaman creature token with haste for each 1 damage prevented this way.\nWhen Hostility is put into a graveyard from anywhere, shuffle it into its owner's library.",
  static: [
    {
      affects: { scope: "self" },
      // Only instants and sorceries deal damage as spells (a permanent spell
      // deals none while on the stack).
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        source: { typesAnyOf: ["instant", "sorcery"], controlledBy: "you" },
        to: "opponent",
        then: { kind: "create-token", token: "Elemental Shaman Token (Haste)", count: "x" },
      },
      text: "If a spell you control would deal damage to an opponent, prevent that damage. Create a 3/1 red Elemental Shaman creature token with haste for each 1 damage prevented this way.",
    },
  ],
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: "When Hostility is put into a graveyard from anywhere, shuffle it into its owner's library.",
    },
  ],
});
