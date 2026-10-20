import { defineCard } from "../define.js";

const TEXT =
  "This token's power is equal to the number of card types among cards in your graveyard and its toughness is equal to that number plus 1.";

/** Consuming Blob's end-step Ooze. */
export default defineCard({
  name: "Ooze Token (Consuming Blob)",
  art: "faa10292-f358-48c1-a516-9a1eecf62b1d",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      // "Your graveyard" — the cards you own there (Winter, Misanthropic Guide's count).
      setBasePtFromCount: { countOf: { cardTypesInGraveyard: { ownedBy: "you" } }, plusPower: 0, plusToughness: 1 },
      text: TEXT,
    },
  ],
});
