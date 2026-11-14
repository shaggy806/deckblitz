import { defineCard } from "../define.js";

// EDHREC rank 12363.
//
// - The first ability is River Song's Diary's: the spell's card, whoever owns
//   it, is exiled linked to this (rule 607.2a) as it resolves — a spell that's
//   countered or never resolves isn't (the ruling).
// - The last ability casts any number of the linked cards free, a running
//   total of mana value X or less (Primeval Spawn's `totalManaValue`), read
//   through the sacrificed Rod's link (Izzet Chemister's). An {X} in a card's
//   cost is 0 cast this way.

const EXILE_TEXT =
  "Whenever a player casts an instant or sorcery spell, exile it instead of putting it into a graveyard as it resolves.";
const CAST_TEXT =
  "{X}, {T}, Sacrifice this artifact: You may cast any number of spells from among cards exiled with this artifact with total mana value X or less without paying their mana costs.";

export default defineCard({
  name: "Rod of Absorption",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "exile-spell-as-it-resolves", anyOwner: true, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", free: true, repeat: true, totalManaValue: "x" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
