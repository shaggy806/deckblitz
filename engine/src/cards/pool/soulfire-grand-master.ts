import { defineCard } from "../define.js";

// The activated ability isn't a trigger: the next instant or sorcery cast from
// your hand is marked as it's cast. Countered, it stays used up and goes to the
// graveyard; a spell that exiles itself isn't put into your hand (the rulings).
const TEXT =
  "{2}{U/R}{U/R}: The next time you cast an instant or sorcery spell from your hand this turn, put that card into your hand instead of into your graveyard as it resolves.";

export default defineCard({
  name: "Soulfire Grand Master",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\nInstant and sorcery spells you control have lifelink.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { keywords: ["lifelink"], filter: { typesAnyOf: ["instant", "sorcery"] } },
      text: "Instant and sorcery spells you control have lifelink.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U/R}{U/R}", tap: false },
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        castFrom: ["hand"],
        filter: { typesAnyOf: ["instant", "sorcery"] },
        intoHandAsItResolves: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
