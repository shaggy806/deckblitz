import { defineCard } from "../define.js";

export default defineCard({
  name: "Varolz, the Scar-Striped",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Troll", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Each creature card in your graveyard has scavenge. The scavenge cost is equal to its mana cost. (Exile a creature card from your graveyard and pay its mana cost: Put a number of +1/+1 counters equal to that card's power on target creature. Scavenge only as a sorcery.)\nSacrifice another creature: Regenerate Varolz.",
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { type: "creature" }, keywords: [{ keyword: "scavenge" }] },
      text: "Each creature card in your graveyard has scavenge. The scavenge cost is equal to its mana cost.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice another creature: Regenerate Varolz.",
      otherOnly: true,
    },
  ],
});
