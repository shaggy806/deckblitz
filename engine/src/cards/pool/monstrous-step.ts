import { defineCard } from "../define.js";

// EDHREC rank 24128. The optional second slot (Mabel's
// Mettle's shape) takes a `block-if-able` requirement naming the first
// target as the attacker; left empty, nothing more happens.

export default defineCard({
  name: "Monstrous Step",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Target creature gets +7/+7 until end of turn. Up to one other target creature blocks it this turn if able.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 7, toughness: 7, duration: "end-of-turn" },
      { kind: "block-if-able", target: 1, attacker: 0 },
    ],
  },
});
