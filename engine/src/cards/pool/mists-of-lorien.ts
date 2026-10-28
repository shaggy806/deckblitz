import { defineCard } from "../define.js";

export default defineCard({
  name: "Mists of Lórien",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "{U}", keyword: "replicate", multi: true },
  text: "Replicate {U} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nReturn target nonland permanent and each other nonland permanent with the same mana value as that permanent to their owners' hands.",
  targets: ["nonland-permanent"],
  // The target matches its own filter, so one mass bounce returns it with the
  // rest, all at once.
  effect: {
    kind: "return-to-hand-all",
    filter: { notTypes: ["land"], manaValue: { op: "eq", n: { amount: { manaValueOf: 0 } } } },
  },
});
