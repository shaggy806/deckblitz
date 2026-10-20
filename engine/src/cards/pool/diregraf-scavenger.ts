import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, exile up to one target card from a graveyard. If a creature card was exiled this way, each opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Diregraf Scavenger",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Bear"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 2, who: "each-opponent" },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
