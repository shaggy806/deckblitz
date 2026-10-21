import { defineCard } from "../define.js";

// The haste goes to the Elementals there as it resolves, after the tokens
// are made — them and this creature included (its ruling; rule 611.2c).

export default defineCard({
  name: "Scampering Scorcher",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, create two 1/1 red Elemental creature tokens. Elementals you control gain haste until end of turn. (They can attack and {T} this turn.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "1/1 Red Elemental Token", count: 2 },
          {
            kind: "grant-keyword-all",
            filter: { subtype: "Elemental", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, create two 1/1 red Elemental creature tokens. Elementals you control gain haste until end of turn.",
    },
  ],
});
