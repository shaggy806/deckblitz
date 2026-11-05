import { defineCard } from "../define.js";

// The token is a copy of the card Gingerbrute in the Oracle card reference (the
// ruling), its mana cost and name included.
const MONARCH_TEXT = "When Ginger enters, you become the monarch.";
const LIFE_TEXT = "{2}, {T}, Sacrifice Ginger: You gain 6 life.";
const UPKEEP_TEXT = "At the beginning of each upkeep, if you're the monarch, create a Gingerbrute token.";

export default defineCard({
  name: "Ginger, Queen of Sweets",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Noble"],
  power: 6,
  toughness: 4,
  text: `${MONARCH_TEXT}\n${LIFE_TEXT}\n${UPKEEP_TEXT} (It's a {1} 1/1 Food Golem artifact creature with haste, "{1}: This token can't be blocked this turn except by creatures with haste," and "{2}, {T}, Sacrifice this token: You gain 3 life.")`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 6 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "monarch", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Gingerbrute Token", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
