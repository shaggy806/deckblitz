import { defineCard } from "../define.js";

// EDHREC rank 26071.
//
// Rulings:
//   [2021-09-24] "Disturb [cost]" means "You may cast this card transformed from your graveyard by
//     paying [cost] rather than its mana cost."
//   [2021-09-24] The back face of each card with disturb has an ability that instructs its
//     controller to exile if it would be put into a graveyard from anywhere. This includes going
//     to the graveyard from the stack, so if the spell is countered after you cast it using the
//     disturb ability, it will be put into exile.
//   [2021-09-24] A spell cast this way enters the battlefield with its back face up.
//
// Disturb (rule 702.146) — the back face is Departed Soulkeeper.

const TAP_TEXT = "Whenever you cast a spell from your graveyard, tap target creature you don't control.";

export default defineCard({
  name: "Devoted Grafkeeper",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 1,
  disturb: { cost: "{1}{W}{U}" },
  text: `When this creature enters, mill two cards.\n${TAP_TEXT}\nDisturb {1}{W}{U} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  triggered: [
    {
      resolve: null,
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      text: "When this creature enters, mill two cards.",
    },
    {
      resolve: null,
      trigger: { on: "cast-spell", who: "you", from: "graveyard" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      text: TAP_TEXT,
    },
  ],
  faces: ["Devoted Grafkeeper", "Departed Soulkeeper"],
  transform: true,
});
