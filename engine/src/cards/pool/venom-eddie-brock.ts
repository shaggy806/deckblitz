import { defineCard } from "../define.js";

// EDHREC rank 11882. Whether the creature was a Villain is read as it last
// existed on the battlefield.

const DIES_TEXT =
  "Whenever another creature dies, put a +1/+1 counter on Venom. If that creature was a Villain, draw a card.";

export default defineCard({
  name: "Venom, Eddie Brock",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Symbiote", "Villain"],
  power: 6,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { subtype: "Villain" } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
