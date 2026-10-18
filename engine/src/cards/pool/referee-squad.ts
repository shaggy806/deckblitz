import { defineCard } from "../define.js";

// EDHREC rank 19279.
//
// Constrictor Sage's tap-and-stun; it can target a creature that's already
// tapped (the ruling), which still gets the stun counter.
//
// Rulings:
//   [2023-04-14] Referee Squad's enters-the-battlefield ability can target a creature that's
//     already tapped.

const ENTER_TEXT =
  "When this creature enters, tap target creature an opponent controls and put a stun counter on it.";

export default defineCard({
  name: "Referee Squad",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nVigilance\n${ENTER_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
