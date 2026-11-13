import { defineCard } from "../define.js";

// Each opponent's sacrifice is one event; the life is the greatest power among
// the creatures sacrificed this way, as each last existed (Consume's reading).
// Madness's cost has a part that isn't mana, the 8 life, paid with its {2}{B}
// when it's cast that way (`madness.also`).
const ENTERS =
  "When this creature enters, each opponent sacrifices a creature with the greatest power among creatures they control. You gain life equal to the greatest power among creatures sacrificed this way.";

export default defineCard({
  name: "Shadowgrange Archfiend",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 8,
  toughness: 4,
  madness: { cost: "{2}{B}", also: { text: "Pay 8 life", payLife: 8 } },
  text: `${ENTERS}\nMadness—{2}{B}, Pay 8 life. (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sacrifice",
            who: "each-opponent",
            filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
            count: 1,
          },
          { kind: "gain-life", amount: { aggregate: "max", of: "power", filter: {}, in: { thisWay: "sacrificed" } } },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
