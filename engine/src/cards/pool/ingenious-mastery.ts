import { defineCard } from "../define.js";

// Cast for {2}{U}, no X is announced: the alternative cost has none. "An
// opponent" isn't a target: the caster chooses as it resolves.

export default defineCard({
  name: "Ingenious Mastery",
  manaCost: "{X}{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "You may pay {2}{U} rather than pay this spell's mana cost.\nIf the {2}{U} cost was paid, you draw three cards, then an opponent creates two Treasure tokens and they scry 2. If that cost wasn't paid, you draw X cards.",
  alternativeCost: { mana: "{2}{U}" },
  effect: {
    kind: "conditional",
    condition: { kind: "self-alternative-cost-paid" },
    then: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 3 },
        {
          kind: "choose-opponent",
          then: {
            kind: "as-player",
            who: "that-player",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "create-token", token: "Treasure Token", count: 2 },
                { kind: "scry", amount: 2 },
              ],
            },
          },
        },
      ],
    },
    else: { kind: "draw", amount: "x" },
  },
});
