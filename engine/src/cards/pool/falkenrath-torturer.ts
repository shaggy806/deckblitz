import { defineCard } from "../define.js";

// EDHREC rank 21131. Falkenrath Aristocrat's shape: the Human check reads the
// sacrificed creature as it last existed on the battlefield (its ruling), and
// the torturer may sacrifice itself.

const TEXT =
  "Sacrifice a creature: This creature gains flying until end of turn. If the sacrificed creature was a Human, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Falkenrath Torturer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "sacrificed", filter: { subtype: "Human" } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
