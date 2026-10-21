import { defineCard } from "../define.js";

// Stockpiling Celebrant's targeted "you may return … If you do": the target
// is chosen as the trigger goes on the stack, the "may" asked as it
// resolves, and the life read off the creature as it last existed on the
// battlefield (its {X} is 0 there — the ruling). An illegal target by then
// means the ability doesn't resolve: no return, no life.

const ETB_TEXT =
  "When Niambi enters, you may return another target creature you control to its owner's hand. If you do, you gain life equal to that creature's mana value.";
const DRAW_TEXT = "{1}{W}{U}, {T}, Discard a legendary card: Draw two cards.";

export default defineCard({
  name: "Niambi, Esteemed Speaker",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "may",
        prompt: "Return the targeted creature to its owner's hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "returned-to-hand" },
              then: { kind: "gain-life", amount: { manaValueOf: 0 } },
            },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}{U}", tap: true, discard: { count: 1, filter: { supertype: "legendary" } } },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
