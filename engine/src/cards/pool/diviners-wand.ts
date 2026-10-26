import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11608.
//
// Rulings: the attach trigger fires for any Wizard creature, whoever controls
// it — you may attach the Wand to another player's creature this way and keep
// controlling the Wand. The granted abilities belong to the equipped creature:
// "you" in them is its controller, and only they can activate "{4}: Draw a
// card" (Thornbite Staff's shape).

const PUMP = "Whenever you draw a card, this creature gets +1/+1 and gains flying until end of turn.";
const DRAW = "{4}: Draw a card.";
const GRANT_TEXT = `Equipped creature has "Whenever you draw a card, this creature gets +1/+1 and gains flying until end of turn" and "${DRAW}"`;
const ATTACH_TEXT = "Whenever a Wizard creature enters, you may attach this Equipment to it.";

export default defineCard({
  name: "Diviner's Wand",
  manaCost: "{3}",
  colors: [],
  types: ["kindred", "artifact"],
  subtypes: ["Wizard", "Equipment"],
  text: `${GRANT_TEXT}\n${ATTACH_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "draws", who: "you" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
              { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
            ],
          },
          resolve: null,
          text: PUMP,
        },
      ],
      grantsActivated: [
        {
          cost: { mana: "{4}", tap: false },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: DRAW,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", subtype: "Wizard" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Diviner's Wand to that Wizard?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
