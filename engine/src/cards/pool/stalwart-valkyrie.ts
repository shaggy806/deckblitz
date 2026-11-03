import { defineCard } from "../define.js";

// An alternative cost with a non-mana part in a keyword's shape (rule 118.9,
// `alternativeCost.also`): the creature card is chosen as the cost is paid,
// the spell already on the stack (601.2h).

export default defineCard({
  name: "Stalwart Valkyrie",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "You may pay {1}{W} and exile a creature card from your graveyard rather than pay this spell's mana cost.\nFlying",
  alternativeCost: {
    mana: "{1}{W}",
    also: {
      text: "exile a creature card from your graveyard",
      exileFromGraveyard: { count: 1, filter: { type: "creature" } },
    },
  },
});
