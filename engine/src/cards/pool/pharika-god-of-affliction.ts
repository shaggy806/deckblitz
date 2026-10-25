import { defineCard } from "../define.js";

const DEVOTION_TEXT = "As long as your devotion to black and green is less than seven, Pharika isn't a creature.";
const EXILE_TEXT =
  "{B}{G}: Exile target creature card from a graveyard. Its owner creates a 1/1 black and green Snake enchantment creature token with deathtouch.";

// "Its owner": a card off the battlefield is controlled by its owner
// (`moveObject` hands a departing permanent back), so `who: "target-controller"`
// on the exiled graveyard card names its owner.
export default defineCard({
  name: "Pharika, God of Affliction",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 5,
  keywords: ["indestructible"],
  text: `Indestructible\n${DEVOTION_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}{G}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "create-token",
            token: "Black Green Enchantment Snake Token (Deathtouch)",
            count: 1,
            who: "target-controller",
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["B", "G"], atMost: 6 },
      removeTypes: ["creature"],
      text: DEVOTION_TEXT,
    },
  ],
});
