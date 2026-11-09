import { defineCard } from "../define.js";

// "Except it isn't legendary if the spell is legendary" is a copy exception
// (rule 707.9b): a nonlegendary spell's copy is nonlegendary either way, so
// it's `notLegendary` always. It stays with the token the copy becomes
// (707.10f), so the legend rule doesn't see two.
export default defineCard({
  name: "Double Major",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["instant"],
  text:
    "Copy target creature spell you control, except it isn't legendary if the spell is legendary. (A copy of a creature spell becomes a token.)",
  targets: [{ kind: "spell", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "copy-spell", target: 0, except: { removeSupertypes: ["legendary"] } },
});
