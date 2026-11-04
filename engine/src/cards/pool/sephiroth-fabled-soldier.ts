import { defineCard } from "../define.js";

// Final Fantasy.

const ENTERS_OR_ATTACKS_TEXT =
  "Whenever Sephiroth enters or attacks, you may sacrifice another creature. If you do, draw a card.";
const DIES_TEXT =
  "Whenever another creature dies, target opponent loses 1 life and you gain 1 life. If this is the fourth time this ability has resolved this turn, transform Sephiroth.";

const mayFeed = {
  kind: "each-player-may",
  who: "you",
  options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
  ifDid: { kind: "draw", amount: 1 },
} as const;

export default defineCard({
  name: "Sephiroth, Fabled SOLDIER",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Avatar", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${ENTERS_OR_ATTACKS_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: mayFeed,
      resolve: null,
      text: ENTERS_OR_ATTACKS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: mayFeed,
      resolve: null,
      text: ENTERS_OR_ATTACKS_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 4 },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Sephiroth, Fabled SOLDIER", "Sephiroth, One-Winged Angel"],
  transform: true,
});
