import { defineCard } from "../define.js";

// Final Fantasy. The back face of Sephiroth, Fabled SOLDIER.

const EMBLEM_LINE = "Whenever a creature dies, target opponent loses 1 life and you gain 1 life.";
const SUPER_NOVA_TEXT = `Super Nova — As this creature transforms into Sephiroth, One-Winged Angel, you get an emblem with "${EMBLEM_LINE}"`;
const ATTACKS_TEXT =
  "Whenever Sephiroth attacks, you may sacrifice any number of other creatures. If you do, draw that many cards.";

export default defineCard({
  name: "Sephiroth, One-Winged Angel",
  manaCost: "",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Angel", "Nightmare", "Avatar"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${SUPER_NOVA_TEXT}\n${ATTACKS_TEXT}`,
  asTransformsInto: {
    kind: "create-emblem",
    text: EMBLEM_LINE,
    triggered: [
      {
        trigger: { on: "dies", who: "any", filter: { type: "creature" } },
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 1, target: 0 },
            { kind: "gain-life", amount: 1 },
          ],
        },
        resolve: null,
        text: EMBLEM_LINE,
      },
    ],
  },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            exceptSource: true,
            upTo: { countOf: { type: "creature", controlledBy: "you" } },
            then: { kind: "sacrifice-target", target: 0 },
            prompt: "Sacrifice any number of other creatures",
          },
          { kind: "draw", amount: { thisWay: "sacrificed" } },
        ],
      },
      resolve: null,
      text: ATTACKS_TEXT,
    },
  ],
  faces: ["Sephiroth, Fabled SOLDIER", "Sephiroth, One-Winged Angel"],
  transform: true,
});
