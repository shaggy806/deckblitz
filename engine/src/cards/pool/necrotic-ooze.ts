import { defineCard } from "../define.js";

// Every creature card in every graveyard, read live: a card that leaves
// takes its abilities with it. Only abilities that work on the battlefield
// (unearth and the like do nothing here, rule 113.6), and one naming its card
// means this creature (rule 201.5b) — "Sacrifice Llanowar Elves" sacrifices
// the Ooze.
const GRANT_TEXT =
  "As long as this creature is on the battlefield, it has all activated abilities of all creature cards in all graveyards.";

export default defineCard({
  name: "Necrotic Ooze",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 4,
  toughness: 3,
  text: GRANT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "graveyard", filter: { type: "creature" } },
      text: GRANT_TEXT,
    },
  ],
});
