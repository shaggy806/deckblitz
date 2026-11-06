import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const SPEND_TEXT = "Spend this mana only to cast an artifact spell or activate an ability of an artifact source.";
const GRANTED = `{T}: Add {C}. ${SPEND_TEXT}`;
const TEXT = `Artifact creatures you control have "${GRANTED}"`;

export default defineCard({
  name: "Ambulatory Reactor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: "C",
            amount: 1,
            spendOnly: {
              spell: { type: "artifact" },
              abilityOf: { type: "artifact" },
              abilityOfAnyZone: true,
              text: SPEND_TEXT,
            },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
