import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// Rulings:
//   You can play lands from among cards exiled with The Omenkeel for as long as they remain
//     exiled, even if The Omenkeel leaves the battlefield or another player gains control of it.
//   The Omenkeel doesn't allow you to play additional lands during your turn, nor does it allow
//     you to play lands at times you normally can't. In most cases, you'll be able to play only
//     one land from among cards exiled with The Omenkeel during each of your turns.
//   In the Commander variant, a double-faced card's color identity is determined by the mana
//     costs and mana symbols in the rules text of both faces combined.
//   The mana value of a modal double-faced card is based on the characteristics of the face
//     that's being considered. On the stack and battlefield, consider whichever face is up. In
//     all other zones, consider only the front face.
//   If an effect allows you to play a land or cast a spell from among a group of cards, you may
//     play or cast a modal double-faced card with any face that fits the criteria of that effect.

const EXILE_TEXT =
  "Whenever a Vehicle you control deals combat damage to a player, that player exiles that many cards from the top of their library. You may play lands from among those cards for as long as they remain exiled.";

export default defineCard({
  name: "The Omenkeel",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  text: `${EXILE_TEXT}\n${crewText(1)}`,
  activated: [crew(1, crewText(1))],
  faces: ["Cosima, God of the Voyage", "The Omenkeel"],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: { triggerValue: true },
        whose: "trigger-player",
        duration: "while-exiled",
        play: true,
        filter: { type: "land" },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
