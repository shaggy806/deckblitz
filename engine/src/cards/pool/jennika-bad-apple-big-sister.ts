import { defineCard } from "../define.js";

// EDHREC rank 19913.
// Makes Mutant → use "Mutant Token".

export default defineCard({
  name: "Jennika, Bad Apple Big Sister",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 3,
  toughness: 3,
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  text: "When Jennika enters, create a 2/2 red Mutant creature token.\nPlainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutant Token", count: 1 },
      resolve: null,
      text: "When Jennika enters, create a 2/2 red Mutant creature token.",
    },
  ],
});
