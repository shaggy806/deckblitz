import { defineCard } from "../define.js";

// EDHREC rank 9104. Fallout.
//
// "If its power was different from its base power" reads the creature as it
// last existed on the battlefield, which can't change between the trigger
// and its resolution, so the trigger's filter is the whole condition (Kutzil,
// Malamet Exemplar's `{ own: "basePower" }` compare). Base power is after
// layer 7b — a CDA or a setting effect counts, a counter or a pump doesn't
// (the rulings). "Sacrifice a creature" may be Jason Bright himself.
const DIES_TEXT =
  "Whenever a Zombie or Mutant you control dies, if its power was different from its base power, draw a card.";
const FLY_TEXT =
  "Come Fly With Me — {2}, Sacrifice a creature: Put a +1/+1 counter on target creature you control. It gains flying until end of turn.";

export default defineCard({
  name: "Jason Bright, Glowing Prophet",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant", "Advisor"],
  power: 2,
  toughness: 3,
  text: `${DIES_TEXT}\n${FLY_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "creature-you-control" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: FLY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: {
          type: "creature",
          subtypes: ["Zombie", "Mutant"],
          power: { op: "ne", n: { own: "basePower" } },
        },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
