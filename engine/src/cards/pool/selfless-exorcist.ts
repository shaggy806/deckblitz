import { defineCard } from "../define.js";

const TEXT = "{T}: Exile target creature card from a graveyard. That card deals damage equal to its power to this creature.";

export default defineCard({
  name: "Selfless Exorcist",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "damage", amount: { powerOf: 0 }, target: "source", from: { target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
