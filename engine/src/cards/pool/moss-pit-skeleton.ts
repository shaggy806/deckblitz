import { defineCard } from "../define.js";

// EDHREC rank 21533. Zendikar Rising.
//
// The graveyard trigger works only there (`fromGraveyard`, Genesis's shape),
// with "if this card is in your graveyard" an intervening if on the same card
// (rule 603.4). `counters-put` fires for a creature entering with counters
// too (rule 122.6 — the ruling), once per creature.

const ENTER_TEXT = "If this creature was kicked, it enters with three +1/+1 counters on it.";
const RETURN_TEXT =
  "Whenever one or more +1/+1 counters are put on a creature you control, if this card is in your graveyard, you may put this card on top of your library.";

export default defineCard({
  name: "Moss-Pit Skeleton",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Skeleton"],
  power: 2,
  toughness: 2,
  text: `Kicker {3} (You may pay an additional {3} as you cast this spell.)\n${ENTER_TEXT}\n${RETURN_TEXT}`,
  kicker: { cost: "{3}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 3, else: 0 } },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "counters-put", who: "you-control", counter: "+1/+1", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put Moss-Pit Skeleton on top of your library?",
        effect: { kind: "put-on-library", target: "source", position: "top" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
