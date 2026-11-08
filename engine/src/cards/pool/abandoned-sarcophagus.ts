import { defineCard } from "../define.js";

const CAST_TEXT = "You may cast spells that have a cycling ability from your graveyard.";
const EXILE_TEXT =
  "If a card that has a cycling ability would be put into your graveyard from anywhere and it wasn't cycled, exile it instead.";

// Rulings:
//   Abandoned Sarcophagus doesn't grant you permission to do anything with those cards except cast
//     them. For example, you can't cycle nonland cards with cycling from your graveyard.
//   A token permanent with cycling will go to your graveyard before ceasing to exist. It won't be
//     exiled. Similarly, a nontoken permanent that lost cycling while it was on the battlefield
//     will also go to your graveyard.
//   Certain older cards have variants of cycling, such as basic landcycling or Wizardcycling.
//     Abandoned Sarcophagus's effect lets you cast these cards and exiles them if they weren't
//     discarded for their cycling variant's ability.
export default defineCard({
  name: "Abandoned Sarcophagus",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${CAST_TEXT}\n${EXILE_TEXT}`,
  static: [
    { affects: { scope: "self" }, castFromGraveyard: { filter: { hasKeyword: "cycling" } }, text: CAST_TEXT },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        notCycled: true,
        filter: { ownedBy: "you", token: false, hasKeyword: "cycling" },
      },
      text: EXILE_TEXT,
    },
  ],
});
