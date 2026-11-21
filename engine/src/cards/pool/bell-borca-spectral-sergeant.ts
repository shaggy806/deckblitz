import { defineCard } from "../define.js";

// The rulings: it notes mana values only while it's on the battlefield as a
// card is put into exile, each card as it is in exile; its power is 0 off the
// battlefield and before anything is noted that turn.
export default defineCard({
  name: "Bell Borca, Spectral Sergeant",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 0,
  toughness: 5,
  text:
    "Note the mana value of each card as it's put into exile.\n" +
    "Bell Borca's power is equal to the greatest number noted for it this turn.\n" +
    "At the beginning of your upkeep, exile the top card of your library. You may play that card this turn.",
  static: [
    {
      affects: { scope: "self" },
      notesExiledManaValues: true,
      text: "Note the mana value of each card as it's put into exile.",
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "greatest-noted-mana-value", plusPower: 0, plusToughness: 0, only: "power" },
      text: "Bell Borca's power is equal to the greatest number noted for it this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: "At the beginning of your upkeep, exile the top card of your library. You may play that card this turn.",
    },
  ],
});
