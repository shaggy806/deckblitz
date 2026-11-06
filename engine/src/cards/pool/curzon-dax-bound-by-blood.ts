import { defineCard } from "../define.js";

// EDHREC rank 31463.

const DIES_OTHER_TEXT = "Whenever another Klingon or Warrior you control dies, Curzon Dax deals 1 damage to each opponent.";
const DIES_SELF_TEXT =
  "When Curzon Dax dies, you may put a creature card with mana value 3 or less from your hand onto the battlefield.";

export default defineCard({
  name: "Curzon Dax, Bound by Blood",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Trill", "Warrior"],
  power: 4,
  toughness: 3,
  text: `${DIES_OTHER_TEXT}\n${DIES_SELF_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { subtypes: ["Klingon", "Warrior"] }, otherOnly: true },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: DIES_OTHER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: DIES_SELF_TEXT,
    },
  ],
});
