import { defineCard } from "../define.js";

// +2 with no target chosen still gains the life; a chosen target gone
// illegal stops the whole ability (its rulings) — the targeting rules.

export default defineCard({
  name: "Ajani, Inspiring Leader",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 5,
  text: "+2: You gain 2 life. Put two +1/+1 counters on up to one target creature.\n−3: Exile target creature. Its controller gains 2 life.\n−10: Creatures you control gain flying and double strike until end of turn.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
        ],
      },
      resolve: null,
      text: "+2: You gain 2 life. Put two +1/+1 counters on up to one target creature.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "gain-life", amount: 2, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: "−3: Exile target creature. Its controller gains 2 life.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "flying",
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "double-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "−10: Creatures you control gain flying and double strike until end of turn.",
    },
  ],
});
