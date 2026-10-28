import { defineCard } from "../define.js";

// EDHREC rank 3841.
//
// Jenova Cells: the counter is optional, the 7/5 isn't — and the creatures it
// sets are the modified ones you control as it resolves (rule 611.2c), in
// layer 7b, under any later +1/+1 counters and pumps (its ruling). "Modified"
// is rule 700.9: a counter, an Equipment (anyone's), or an Aura you control.
// The Reunion works only from the graveyard and doesn't exile the card.

const CELLS_TEXT =
  "Jenova Cells — Whenever Sephiroth attacks, you may put a cell counter on target creature. Until end of turn, each modified creature you control has base power and toughness 7/5. (Equipment, Auras you control, and counters are modifications.)";
const REUNION_TEXT =
  "The Reunion — {3}, Sacrifice a modified creature: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Sephiroth, Fallen Hero",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Avatar", "Soldier"],
  power: 7,
  toughness: 5,
  text: `${CELLS_TEXT}\n${REUNION_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "may",
            prompt: "Put a cell counter on target creature?",
            effect: { kind: "add-counter", target: 0, counter: "cell", amount: 1 },
          },
          {
            kind: "animate-all",
            filter: { type: "creature", controlledBy: "you", modified: true },
            power: 7,
            toughness: 5,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: CELLS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false, sacrifice: { filter: { type: "creature", modified: true } } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: REUNION_TEXT,
    },
  ],
});
