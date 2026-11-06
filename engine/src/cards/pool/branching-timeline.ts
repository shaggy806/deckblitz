import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 29328.

// "Strange new worlds" is an ability word: no rules of its own.
const DISTINCT_LANDS: EffectAmount = { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } };

// Every permanent card revealed goes (min = max = X takes all that match).
export default defineCard({
  name: "Branching Timeline",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Strange new worlds — Reveal the top X cards of your library, where X is the number of differently named lands you control. Put all permanent cards revealed this way onto the battlefield tapped and the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: DISTINCT_LANDS,
    reveal: true,
    min: DISTINCT_LANDS,
    max: DISTINCT_LANDS,
    filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
    destination: "battlefield",
    enterTapped: true,
    leftover: "bottom-random",
  },
});
