import { defineCard } from "../define.js";

// The back face of Flamewar, Brash Veteran, cast converted by its More Than
// Meets the Eye (rule 702.162a). Living metal (702.161a): during your turn it's
// an artifact creature as well. The combat damage dealt is "that many"; the
// cards are exiled face down for nobody to see (rule 406.3, its ruling), each
// with an intel counter, then it converts (701.28a) — back to the Robot, whose
// "{1}, Discard your hand" puts them into your hand.
//
// Rulings:
//   [2022-10-14] You don't get to look at the cards exiled by Flamewar, Streetwise Operative's
//     triggered ability.
//   [2022-10-14] While it's a creature, the Vehicle has its printed power and toughness.

const LIVING_METAL_TEXT = "Living metal (During your turn, this Vehicle is also a creature.)";
const DAMAGE_TEXT =
  "Whenever Flamewar deals combat damage to a player, exile that many cards from the top of your library face down. Put an intel counter on each of them. Convert Flamewar.";

export default defineCard({
  name: "Flamewar, Streetwise Operative",
  // A back face has no Scryfall card of its own name — point at its art.
  art: "https://cards.scryfall.io/art_crop/back/8/7/876d9732-9201-4327-8748-7c87ec55453f.jpg",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 1,
  keywords: ["menace", "deathtouch"],
  text: `${LIVING_METAL_TEXT}\nMenace, deathtouch\n${DAMAGE_TEXT}`,
  faces: ["Flamewar, Brash Veteran", "Flamewar, Streetwise Operative"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{B}{R}" },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      addTypes: ["creature"],
      text: LIVING_METAL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "exile-from-library",
            amount: { triggerValue: true },
            faceDown: true,
            withCounters: { kind: "intel", amount: 1 },
          },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
