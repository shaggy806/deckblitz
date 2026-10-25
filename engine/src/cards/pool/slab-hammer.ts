import { defineCard } from "../define.js";

// EDHREC rank 23641.
//
// The land is chosen, not targeted, as it resolves (choosing none declines);
// only a land actually returned pumps "the creature" — the one that attacked
// (Sutina, Speaker of the Tajuru's shape).
const TEXT =
  "Whenever equipped creature attacks, you may return a land you control to its owner's hand. If you do, the creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Slab Hammer",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "land", controlledBy: "you" },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "You may return a land you control to its owner's hand",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 2, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
