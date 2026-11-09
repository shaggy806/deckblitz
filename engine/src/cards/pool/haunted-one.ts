import { defineCard } from "../define.js";
import { undying } from "../helpers.js";

// EDHREC rank 4770. "It and other creatures you control that share a creature
// type with it": sharesCreatureTypeWith holds for the reference object itself.
// Undying granted is the keyword's triggered ability until end of turn.
const THEM = { type: "creature", controlledBy: "you", sharesCreatureTypeWith: "source" } as const;
const QUOTED =
  "Whenever this creature becomes tapped, it and other creatures you control that share a creature type with it each get +2/+0 and gain undying until end of turn.";

export default defineCard({
  name: "Haunted One",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: `Commander creatures you own have "${QUOTED}" (When a creature with undying dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "becomes-tapped", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "modify-pt-all", filter: THEM, power: 2, toughness: 0, duration: "end-of-turn" },
              { kind: "grant-triggered-all", filter: THEM, ability: undying(), duration: "end-of-turn" },
            ],
          },
          resolve: null,
          text: QUOTED,
        },
      ],
      text: `Commander creatures you own have "${QUOTED}"`,
    },
  ],
});
