import { defineCard } from "../define.js";

// Rulings:
//   To determine the cost of Tazri's activated ability, you choose which cost you'll pay for
//   each of the four mana symbols (either {2} or one mana of the appropriate color).
//   Tazri's activated ability lets you put up to two cards total into your hand, not two
//   cards of each of the listed creature types.

const ABILITY_TEXT =
  "{2/U}{2/B}{2/R}{2/G}: Look at the top six cards of your library. You may reveal up to two Cleric, Rogue, Warrior, Wizard, and/or Ally cards from among them and put them into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Tazri, Beacon of Unity",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 6,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { partySize: "you" },
  },
  text: `This spell costs {1} less to cast for each creature in your party.\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{2/U}{2/B}{2/R}{2/G}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 2,
        filter: { subtypes: ["Cleric", "Rogue", "Warrior", "Wizard", "Ally"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
