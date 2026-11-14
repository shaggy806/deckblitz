import { defineCard } from "../define.js";

// EDHREC rank 8192. "Using its mutate ability" is the permission's `using`:
// cast from the graveyard under it, only for its mutate cost (the rulings:
// not its mana cost or another alternative cost — rule 118.9a), at its usual
// timing. Another permission reaching it keeps its own costs (601.3).

const SELF = "You may cast this card from your graveyard using its mutate ability.";

export default defineCard({
  name: "Brokkos, Apex of Forever",
  manaCost: "{2}{B}{G}{U}",
  colors: ["B", "G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Nightmare", "Beast", "Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  mutate: "{2}{U/B}{G}{G}",
  text: `Mutate {2}{U/B}{G}{G} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nTrample\n${SELF}`,
  mayPlaySelf: { from: ["graveyard"], using: "mutate" },
});
