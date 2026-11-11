import { defineCard } from "../define.js";

// EDHREC rank 5479. The −2 has no duration (its ruling: it lasts until the
// creature leaves the battlefield), and a permanent that stops being a
// creature stops being an Angel until it's one again (rule 205.3d — the
// layer-4 fold drops a subtype that goes with no type the object has).

export default defineCard({
  name: "Archangel Elspeth",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Elspeth"],
  loyalty: 4,
  text:
    "+1: Create a 1/1 white Soldier creature token with lifelink.\n" +
    "−2: Put two +1/+1 counters on target creature. It becomes an Angel in addition to its other types and gains flying.\n" +
    "−6: Return all nonland permanent cards with mana value 3 or less from your graveyard to the battlefield.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Soldier Token", count: 1 },
      resolve: null,
      text: "+1: Create a 1/1 white Soldier creature token with lifelink.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
          { kind: "become", target: 0, addSubtypes: ["Angel"], keywords: ["flying"], duration: "permanent" },
        ],
      },
      resolve: null,
      text: "−2: Put two +1/+1 counters on target creature. It becomes an Angel in addition to its other types and gains flying.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: {
          typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"],
          notTypes: ["land"],
          manaValue: { op: "lte", n: 3 },
        },
        destination: "battlefield",
        count: "all",
      },
      resolve: null,
      text: "−6: Return all nonland permanent cards with mana value 3 or less from your graveyard to the battlefield.",
    },
  ],
});
