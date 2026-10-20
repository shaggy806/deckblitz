import { defineCard } from "../define.js";

// EDHREC rank 9004.

const ENTERS_TEXT =
  "When this creature enters, exile target artifact or creature an opponent controls with mana value 3 or less until this creature leaves the battlefield.";

export default defineCard({
  name: "Annex Sentry",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 1,
  toughness: 4,
  toxic: 1,
  text: `Toxic 1 (Players dealt combat damage by this creature also get a poison counter.)\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
