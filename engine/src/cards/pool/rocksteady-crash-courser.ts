import { defineCard } from "../define.js";

// EDHREC rank 19291.
//
// Rocksteady is a Rhino, not a Boar, so its own restriction is a separate
// static from the Boars'.

export default defineCard({
  name: "Rocksteady, Crash Courser",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rhino", "Mutant"],
  power: 7,
  toughness: 7,
  cycling: { cost: "{2}", search: { subtype: "Forest" } },
  text: "Rocksteady can't be blocked by more than one creature.\nBoars you control can't be blocked by more than one creature.\nForestcycling {2} ({2}, Discard this card: Search your library for a Forest card, reveal it, put it into your hand, then shuffle.)",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }],
      text: "Rocksteady can't be blocked by more than one creature.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Boar", controlledBy: "you" } },
      restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }],
      text: "Boars you control can't be blocked by more than one creature.",
    },
  ],
});
