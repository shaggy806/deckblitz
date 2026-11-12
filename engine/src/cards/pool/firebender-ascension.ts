import { defineCard } from "../define.js";

// EDHREC rank 2511. The token is Fire Nation Attacks's 2/2 red Soldier with firebending 1. The
// second trigger is the `attack-triggers-own-ability` event: an ability an attack declaration
// caused, of a creature that declaration named, as it goes on the stack — so this trigger goes on
// the stack above it, and the copy resolves before it (the ruling). Waterbender Ascension's quest
// counter and check; Rings of Brighthearth's `copy-ability` of `"trigger-ability"`.
//
// Rulings:
//   Firebender Ascension's ability will always go on the stack on top of the triggered ability
//     that caused it to trigger. The copy it creates will be created on the stack on top of the
//     original triggered ability and the copy will resolve before that ability.
//   If the ability is modal, the copy will have the same mode(s).
//   The copy will have the same targets as the ability it's copying unless you choose new ones.

const ENTER_TEXT = "When this enchantment enters, create a 2/2 red Soldier creature token with firebending 1.";
const COPY_TEXT =
  "Whenever a creature you control attacking causes a triggered ability of that creature to trigger, put a quest counter on this enchantment. Then if it has four or more quest counters on it, you may copy that ability. You may choose new targets for the copy.";

export default defineCard({
  name: "Firebender Ascension",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token (Fire Nation Attacks)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "event", event: "attack-triggers-own-ability", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 4 } },
            then: {
              kind: "may",
              prompt: "Copy that ability?",
              effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
            },
          },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
