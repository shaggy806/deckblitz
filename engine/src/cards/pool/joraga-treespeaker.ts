import type { ActivatedAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

// EDHREC rank 4208. At level 5+ the mana ability is granted to every Elf you
// control, this one included (the ruling); at 1-4 it's its own.

const MANA: ActivatedAbility = {
  cost: { mana: null, tap: true },
  targets: [],
  effect: { kind: "add-mana", mana: "G", amount: 2 },
  resolve: null,
  text: "{T}: Add {G}{G}.",
};

export default defineCard({
  name: "Joraga Treespeaker",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 1,
  text: 'Level up {1}{G} ({1}{G}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-4\n1/2\n{T}: Add {G}{G}.\nLEVEL 5+\n1/4\nElves you control have "{T}: Add {G}{G}."',
  activated: [levelUp("{1}{G}"), { ...MANA, condition: levelBand(1, 4) }],
  static: [
    levelStatic(levelBand(1, 4), 1, 2, "LEVEL 1-4\n1/2"),
    levelStatic(levelBand(5), 1, 4, "LEVEL 5+\n1/4"),
    {
      affects: { scope: "filter", filter: { subtype: "Elf", controlledBy: "you" } },
      condition: levelBand(5),
      grantsActivated: [MANA],
      text: 'Elves you control have "{T}: Add {G}{G}."',
    },
  ],
});
