import { defineCard } from "../define.js";

// One choice over the cards discarded this way, a slot per mana value, and
// they all enter at once (the ruling). A discarded card a replacement exiled
// instead can still be chosen (the other ruling): `thisWay: "discarded"` finds
// it in exile.
const artifactOrCreature = (manaValue: number) => ({
  label: `an artifact or creature card with mana value ${manaValue}`,
  filter: { typesAnyOf: ["artifact", "creature"] as const, manaValue: { op: "eq", n: manaValue } as const },
});

const TEXT =
  "{4}, {T}: Discard all the cards in your hand, then draw that many cards. You may choose an artifact or creature " +
  "card with mana value 1 you discarded this way, then do the same for artifact or creature cards with mana values " +
  "2 and 3. Return those cards to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Queen Kayla bin-Kroog",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: { thisWay: "discarded" } },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 3,
            filter: { thisWay: "discarded" },
            together: {
              oneEach: [artifactOrCreature(1), artifactOrCreature(2), artifactOrCreature(3)],
              text: "up to one artifact or creature card with each of mana values 1, 2 and 3",
            },
            destination: "battlefield",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
