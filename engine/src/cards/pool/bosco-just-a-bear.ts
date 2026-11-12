import { defineCard } from "../define.js";

// EDHREC rank 13133. Its ruling: Bosco counts himself.

export default defineCard({
  name: "Bosco, Just a Bear",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bear"],
  power: 4,
  toughness: 4,
  text: "When Bosco enters, create a Food token for each legendary creature you control. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\n{2}{G}, Sacrifice a Food: Put two +1/+1 counters on Bosco. He gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false, sacrifice: { filter: { subtype: "Food" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{2}{G}, Sacrifice a Food: Put two +1/+1 counters on Bosco. He gains trample until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Food Token",
        count: { countOf: { type: "creature", supertype: "legendary", controlledBy: "you" } },
      },
      resolve: null,
      text: "When Bosco enters, create a Food token for each legendary creature you control.",
    },
  ],
});
