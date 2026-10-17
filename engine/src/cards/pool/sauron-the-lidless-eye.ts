import { defineCard } from "../define.js";

// EDHREC rank 10860.

export default defineCard({
  name: "Sauron, the Lidless Eye",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Horror"],
  power: 4,
  toughness: 4,
  text: "When Sauron enters, gain control of target creature an opponent controls until end of turn. Untap it. It gains haste until end of turn.\n{1}{B}{R}: Creatures you control get +2/+0 until end of turn. Each opponent loses 2 life.",
  activated: [
    {
      cost: { mana: "{1}{B}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 0,
            duration: "end-of-turn",
          },
          { kind: "lose-life", amount: 2, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: "{1}{B}{R}: Creatures you control get +2/+0 until end of turn. Each opponent loses 2 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When Sauron enters, gain control of target creature an opponent controls until end of turn. Untap it. It gains haste until end of turn.",
    },
  ],
});
