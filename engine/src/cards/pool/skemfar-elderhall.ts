import { defineCard } from "../define.js";

// "Up to one target creature you don't control": with no target chosen the
// ability just makes the Elves; with one chosen that's illegal on resolution
// the whole ability does nothing (its ruling — rule 608.2b).

export default defineCard({
  name: "Skemfar Elderhall",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {G}.\n{2}{B}{B}{G}, {T}, Sacrifice this land: Up to one target creature you don't control gets -2/-2 until end of turn. Create two 1/1 green Elf Warrior creature tokens. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: "{2}{B}{B}{G}", tap: true, sacrifice: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
          { kind: "create-token", token: "Elf Warrior Token", count: 2 },
        ],
      },
      resolve: null,
      text: "{2}{B}{B}{G}, {T}, Sacrifice this land: Up to one target creature you don't control gets -2/-2 until end of turn. Create two 1/1 green Elf Warrior creature tokens. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
