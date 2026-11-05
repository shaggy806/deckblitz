import { defineCard } from "../define.js";

// "Your first, second, or third turns": turns you've taken, an extra one
// included (its ruling); during another player's turn it may be cast, given
// flash (its ruling). The −6 is The Mirari Conjecture's delayed copy over
// every spell you cast this turn; a copy isn't cast, so it doesn't trigger it.
const LOOT = "+1: Draw a card, then discard a card.";
const PLOT = "+1: You may exile a nonland card with mana value 3 or less from your hand. If you do, it becomes plotted.";
const ULT = "−6: Until end of turn, whenever you cast a spell, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Jace Reawakened",
  manaCost: "{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 3,
  text: `You can't cast Jace Reawakened during your first, second, or third turns of the game.\n${LOOT}\n${PLOT}\n${ULT}`,
  castOnlyIf: { kind: "not", of: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turns-taken", atMost: 3 }] } },
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "exile",
        leftover: "stay",
        filter: { notTypes: ["land"], manaValue: { op: "lte", n: 3 } },
        then: { kind: "become-plotted", target: 0 },
      },
      resolve: null,
      text: PLOT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "cast-spell", who: "you" } },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: "Until end of turn, whenever you cast a spell, copy it. You may choose new targets for the copy.",
      },
      resolve: null,
      text: ULT,
    },
  ],
});
