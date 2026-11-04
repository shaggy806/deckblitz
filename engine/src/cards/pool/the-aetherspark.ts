import { defineCard } from "../define.js";

// Aetherdrift. A planeswalker that's an Equipment: it's attacked and loses
// loyalty as any planeswalker does (rule 306), and attaches as any Equipment
// does (rule 301.5). It has no equip ability, so only the +1 moves it.
//
// "Can't be attacked" restricts declaring attackers (rule 508.1c): one already
// attacked when it attaches stays attacked (the ruling), and a creature put
// onto the battlefield attacking may still choose it (rule 508.4c).
//
// "During your turn" is part of the trigger condition (rule 603.1), not an
// intervening "if", and "that many" is the whole of what the creature dealt at
// once, however many things it was dealt to (rule 603.2c).

const STATIC_TEXT =
  'As long as The Aetherspark is attached to a creature, The Aetherspark can\'t be attacked and has "Whenever equipped creature deals combat damage during your turn, put that many loyalty counters on The Aetherspark."';
const PLUS_TEXT = "+1: Attach The Aetherspark to up to one target creature you control. Put a +1/+1 counter on that creature.";
const DRAW_TEXT = "−5: Draw two cards.";
const MANA_TEXT = "−10: Add ten mana of any one color.";

export default defineCard({
  name: "The Aetherspark",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "planeswalker"],
  subtypes: ["Equipment"],
  loyalty: 4,
  text: `${STATIC_TEXT}\n${PLUS_TEXT}\n${DRAW_TEXT}\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      restrictions: ["cant-be-attacked"],
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "attached", combat: true },
          whileCondition: { kind: "your-turn" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "loyalty", amount: { triggerValue: true } },
          resolve: null,
          text: "Whenever equipped creature deals combat damage during your turn, put that many loyalty counters on The Aetherspark.",
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: 0 },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      // A loyalty ability isn't a mana ability (rule 605.1a): the color's chosen
      // as it resolves, a mode each.
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: (["W", "U", "B", "R", "G"] as const).map((mana) => ({
          text: `Add ${`{${mana}}`.repeat(10)}.`,
          effect: { kind: "add-mana" as const, mana, amount: 10 },
        })),
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
