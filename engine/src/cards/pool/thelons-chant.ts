import { defineCard } from "../define.js";

// Fallen Empires. "Whenever a player puts …" is who put it onto the
// battlefield (`putBy`), and "that player" is them. They choose as it
// resolves: a -1/-1 counter on a creature of theirs (offered only with one to
// put it on — not a blight, rule 701.68, which this text predates), or the
// 3 damage.

const UPKEEP = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {G}.";
const SWAMP =
  "Whenever a player puts a Swamp onto the battlefield, this enchantment deals 3 damage to that player unless the player puts a -1/-1 counter on a creature they control.";

export default defineCard({
  name: "Thelon's Chant",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: [UPKEEP, SWAMP].join("\n"),
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{G}", text: "Pay {G}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "enters-battlefield", who: "any", putBy: "any", filter: { subtype: "Swamp" } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-player",
        options: [
          {
            doing: {
              kind: "choose-permanents",
              filter: { type: "creature", controlledBy: "you" },
              upTo: 1,
              min: 1,
              prompt: "Choose a creature you control to put a -1/-1 counter on",
              then: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
            },
            text: "Put a -1/-1 counter on a creature you control",
          },
        ],
        otherwise: { kind: "damage", amount: 3, who: "trigger-player" },
      },
      resolve: null,
      text: SWAMP,
    },
  ],
});
