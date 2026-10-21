import { defineCard } from "../define.js";

// With {R}{G} spent, the fight trigger is a copy exception — a copiable value,
// so a later copy of the token has it too (the ruling).
const FIGHT = "When this token enters, if it's a creature, it fights up to one target creature you don't control.";

export default defineCard({
  name: "Mythos of Illuna",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Create a token that's a copy of target permanent. If {R}{G} was spent to cast this spell, instead create a token that's a copy of that permanent, except the token has "${FIGHT}"`,
  targets: ["permanent"],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { manaSpentOfColors: { R: 1, G: 1 } } },
    then: {
      kind: "create-token-copy",
      of: 0,
      count: 1,
      who: "you",
      exceptions: {
        triggered: [
          {
            trigger: { on: "enters-battlefield", who: "self" },
            condition: { kind: "source", filter: { type: "creature" } },
            targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
            effect: { kind: "fight", a: "source", b: 0 },
            resolve: null,
            text: FIGHT,
          },
        ],
      },
    },
    else: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
  },
});
