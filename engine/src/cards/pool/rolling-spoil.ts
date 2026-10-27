import { defineCard } from "../define.js";

// EDHREC rank 30288. Ravnica: City of Guilds.

export default defineCard({
  name: "Rolling Spoil",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target land. If {B} was spent to cast this spell, all creatures get -1/-1 until end of turn.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { B: 1 } } },
        then: { kind: "modify-pt-all", filter: { type: "creature" }, power: -1, toughness: -1, duration: "end-of-turn" },
      },
    ],
  },
});
