import { defineCard } from "../define.js";

// Once per target (its ruling: a spell targeting you and two of your permanents
// triggers it three times). "If Rayne is enchanted" is read as it resolves (its
// ruling: the "if" has no special meaning).
const TEXT =
  "Whenever you or a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card. You may draw an additional card if Rayne is enchanted.";

export default defineCard({
  name: "Rayne, Academy Chancellor",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", player: "you", byOpponentOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { enchanted: true } },
            then: { kind: "may", prompt: "Draw an additional card?", effect: { kind: "draw", amount: 1 } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
