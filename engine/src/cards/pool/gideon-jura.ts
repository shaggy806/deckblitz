import { defineCard } from "../define.js";

const PLUS = "+2: During target opponent's next turn, creatures that player controls attack Gideon Jura if able.";
const MINUS = "−2: Destroy target tapped creature.";
const ZERO =
  "0: Until end of turn, Gideon Jura becomes a 6/6 Human Soldier creature that's still a planeswalker. Prevent all damage that would be dealt to him this turn.";

export default defineCard({
  name: "Gideon Jura",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Gideon"],
  loyalty: 6,
  text: `${PLUS}\n${MINUS}\n${ZERO}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "attack-requirement",
        filter: { type: "creature" },
        controlledByTarget: 0,
        attacks: "source",
        duration: { duringTurnOf: { target: 0 } },
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 6,
            toughness: 6,
            addTypes: ["creature"],
            addSubtypes: ["Human", "Soldier"],
            duration: "end-of-turn",
          },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: ZERO,
    },
  ],
});
