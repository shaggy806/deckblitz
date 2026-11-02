import { defineCard } from "../define.js";

const GRANTED = "Whenever you cast a spell that shares a creature type with this creature, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Folk Hero",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Background"],
  supertypes: ["legendary"],
  text: `Commander creatures you own have "${GRANTED}"`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "cast-spell", who: "you", filter: { sharesCreatureTypeWith: "source" } },
          oncePerTurn: true,
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Commander creatures you own have "${GRANTED}"`,
    },
  ],
});
