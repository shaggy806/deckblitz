import { defineCard } from "../define.js";

// EDHREC rank 18809. Marvel Super Heroes Commander.
//
// Rocco, Street Chef's "until your next end step" permission: it lapses as
// Wiccan's controller's next end step begins — this turn's, for a spell
// cast in their own main phase.
const TEXT =
  "Whenever you cast a noncreature spell, exile the top card of your library. Until your next end step, you may play that card.";

export default defineCard({
  name: "Wiccan, Young Avenger",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Warlock", "Hero"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-end-step" },
      resolve: null,
      text: TEXT,
    },
  ],
});
