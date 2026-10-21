import { defineCard } from "../define.js";

// −8: the Vampires there as it resolves gain the ability (rule 611.2c); the
// control change it grants has no end (its ruling) — `untilEndOfTurn: false`
// and no `whileSource`.

const GRANTED_TEXT = "{T}: Gain control of target creature.";

export default defineCard({
  name: "Sorin, Vampire Lord",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sorin"],
  loyalty: 4,
  text: `+1: Up to one target creature gets +2/+0 until end of turn.\n−2: Sorin deals 4 damage to any target. You gain 4 life.\n−8: Until end of turn, each Vampire you control gains "${GRANTED_TEXT}"`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "+1: Up to one target creature gets +2/+0 until end of turn.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
      },
      resolve: null,
      text: "−2: Sorin deals 4 damage to any target. You gain 4 life.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "grant-activated-all",
        filter: { subtype: "Vampire", controlledBy: "you" },
        ability: {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
          resolve: null,
          text: GRANTED_TEXT,
        },
        duration: "end-of-turn",
      },
      resolve: null,
      text: `−8: Until end of turn, each Vampire you control gains "${GRANTED_TEXT}"`,
    },
  ],
});
