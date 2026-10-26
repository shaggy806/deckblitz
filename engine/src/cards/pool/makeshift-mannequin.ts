import { defineCard } from "../define.js";

const MANNEQUIN_TEXT = "When this creature becomes the target of a spell or ability, sacrifice it.";

// Bond of Revival's reanimate-then-grant, with Mathas, Fiend Seeker's
// `whileCounter` duration for the granted trigger.
export default defineCard({
  name: "Makeshift Mannequin",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Return target creature card from your graveyard to the battlefield with a mannequin counter on it. For as long as that creature has a mannequin counter on it, it has "${MANNEQUIN_TEXT}"`,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "mannequin", amount: 1 } },
      {
        kind: "grant-triggered",
        target: 0,
        duration: { whileCounter: "mannequin" },
        ability: {
          trigger: { on: "becomes-target", who: "self" },
          targets: [],
          effect: { kind: "sacrifice-source" },
          resolve: null,
          text: MANNEQUIN_TEXT,
        },
      },
    ],
  },
});
