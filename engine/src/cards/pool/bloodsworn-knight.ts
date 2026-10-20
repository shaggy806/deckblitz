import { defineCard } from "../define.js";

// The back face of Bloodsworn Squire. Its P/T is a characteristic-defining
// ability (Splinterfright's shape): creature cards in its owner's graveyard.
const PT_TEXT =
  "Bloodsworn Knight's power and toughness are each equal to the number of creature cards in your graveyard.";
const TEXT = "{1}{B}, Discard a card: This creature gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Bloodsworn Knight",
  art: "https://cards.scryfall.io/art_crop/back/a/7/a7cbdd54-7685-4921-ab60-dc36e647a4c5.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${TEXT} (Damage and effects that say "destroy" don't destroy it.)`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Bloodsworn Squire", "Bloodsworn Knight"],
  transform: true,
});
