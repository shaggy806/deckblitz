import { defineCard } from "../define.js";

// Star Trek Commander (TRC). Ooze Patrol's ability.

const TEXT =
  "When this creature enters, mill two cards, then put a +1/+1 counter on this creature for each artifact and/or creature card in your graveyard. (To mill two cards, put the top two cards of your library into your graveyard.)";

export default defineCard({
  name: "Ceti Eel",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Worm"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { countInGraveyard: { typesAnyOf: ["artifact", "creature"], ownedBy: "you" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
