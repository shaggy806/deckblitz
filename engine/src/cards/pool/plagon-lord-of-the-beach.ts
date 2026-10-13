import { defineCard } from "../define.js";

// EDHREC rank 8808.
//
// Rulings:
//   [2024-11-08] Plagon's last ability doesn't actually change the target creature's power. It
//     changes only the amount of combat damage the creature assigns. All other rules and effects
//     that check power or toughness use the real values, even if they cause damage "equal to a
//     creature's power" to be dealt.

// The count includes Plagon itself (0/3). "Assigns combat damage equal to
// its toughness" is Walking Bulwark's one-shot: its power is unchanged for
// everything else (the ruling).
export default defineCard({
  name: "Plagon, Lord of the Beach",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Starfish", "Wizard"],
  power: 0,
  toughness: 3,
  text: "When Plagon enters, draw a card for each creature you control with toughness greater than its power.\n{W/U}: Target creature you control assigns combat damage equal to its toughness rather than its power this turn.",
  activated: [
    {
      cost: { mana: "{W/U}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "damage-by-toughness", target: 0 },
      resolve: null,
      text: "{W/U}: Target creature you control assigns combat damage equal to its toughness rather than its power this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "draw",
        amount: {
          countOf: { type: "creature", controlledBy: "you", toughness: { op: "gt", n: { own: "power" } } },
        },
      },
      resolve: null,
      text: "When Plagon enters, draw a card for each creature you control with toughness greater than its power.",
    },
  ],
});
