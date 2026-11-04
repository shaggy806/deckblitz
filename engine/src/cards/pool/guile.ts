import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature can't be blocked except by three or more creatures.";
const COUNTER_TEXT =
  "If a spell or ability you control would counter a spell, instead exile that spell and you may play that card without paying its mana cost.";
const SHUFFLE_TEXT = "When Guile is put into a graveyard from anywhere, shuffle it into its owner's library.";

// Rulings:
//   If a spell or ability you control attempts to counter a spell that can't be countered, it
//     doesn't. Since the spell wouldn't be countered, Guile's ability has no effect on it.
//   Exiling the spell is mandatory. Casting it is not.
//   A spell exiled this way was never actually countered.
export default defineCard({
  name: "Guile",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 6,
  toughness: 6,
  text: `${BLOCK_TEXT}\n${COUNTER_TEXT}\n${SHUFFLE_TEXT}`,
  static: [
    { affects: { scope: "self" }, blockedByAtLeast: 3, text: BLOCK_TEXT },
    { affects: { scope: "self" }, replacement: { event: "would-counter-spell" }, text: COUNTER_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
