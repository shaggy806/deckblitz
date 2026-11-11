import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// The enters trigger sets up a "whenever" watch on its target for this turn
// (`watching: 0`): each combat damage event that creature deals offers the
// exile-and-return.
export default defineCard({
  name: "Long River Lurker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Frog", "Scout"],
  power: 2,
  toughness: 3,
  text:
    "Ward {1}\n" +
    "Other Frogs you control have ward {1}.\n" +
    "When this creature enters, target creature you control can't be blocked this turn. Whenever that creature deals combat damage this turn, you may exile it. If you do, return it to the battlefield under its owner's control.",
  triggered: [
    ward({ mana: "{1}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { whenever: { on: "deals-damage", who: "self", combat: true }, watching: 0 },
            effect: {
              kind: "may",
              prompt: "Exile that creature, then return it to the battlefield?",
              effect: { kind: "flicker", target: "trigger-object" },
            },
            text: "Whenever that creature deals combat damage this turn, you may exile it. If you do, return it to the battlefield under its owner's control.",
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, target creature you control can't be blocked this turn. Whenever that creature deals combat damage this turn, you may exile it. If you do, return it to the battlefield under its owner's control.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Frog", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [ward({ mana: "{1}" })],
      text: "Other Frogs you control have ward {1}.",
    },
  ],
});
