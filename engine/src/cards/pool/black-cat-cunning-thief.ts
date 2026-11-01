import { defineCard } from "../define.js";

// Marvel's Spider-Man (SPM). Another player's library looked at, the two
// exiled face down (only you may look at them — rule 406.3) with a
// permission to play them for as long as they stay exiled, mana of any type
// spendable on the spells (rule 118.14).
//
// Rulings:
//   [2025-09-19] You must follow all normal timing rules when playing a land or casting a spell
//     this way.
//   [2025-09-19] If there are fewer than nine cards left in the opponent's library as the ability
//     resolves, you look at all of the remaining cards.

const TEXT =
  "When Black Cat enters, look at the top nine cards of target opponent's library, exile two of them face down, then put the rest on the bottom of their library in a random order. You may play the exiled cards for as long as they remain exiled. Mana of any type can be spent to cast spells this way.";

export default defineCard({
  name: "Black Cat, Cunning Thief",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 9,
        min: 2,
        max: 2,
        destination: "exile-face-down",
        unlinked: true,
        playable: { duration: "while-exiled", spendAs: "any-type" },
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
