import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 23100.
//
// The power gate is a targeting restriction only: raising its power afterwards, or this creature
// leaving, doesn't end the control effect (the rulings).
const TEXT =
  "When this creature enters, gain control of target creature an opponent controls with power 2 or less until end of turn. Untap that creature. It gains haste until end of turn.";

export default defineCard({
  name: "Enthralling Victor",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${TEXT} (It can attack and {T} this turn.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", filter: { type: "creature", controlledBy: "opponent", power: { op: "lte", n: 2 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
