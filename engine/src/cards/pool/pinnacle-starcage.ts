import { defineCard } from "../define.js";

// Edge of Eternities. Temporary Lockdown's mass exile; the activation puts what
// it exiled into graveyards together, then counts what got there this way. The
// sacrifice comes last, so nothing is left for its leaving to bring back.

const ENTER_TEXT =
  "When this artifact enters, exile all artifacts and creatures with mana value 2 or less until this artifact leaves the battlefield.";
const ACTIVATED_TEXT =
  "{6}{W}{W}: Put each card exiled with this artifact into its owner's graveyard, then create a 2/2 colorless Robot artifact creature token for each card put into a graveyard this way. Sacrifice this artifact.";

export default defineCard({
  name: "Pinnacle Starcage",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "exile-all",
        filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "lte", n: 2 } },
        untilSourceLeaves: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}{W}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-exiled-by-source", linked: "graveyard" },
          { kind: "create-token", token: "Robot Token", count: { thisWay: "put-into-graveyard" } },
          { kind: "sacrifice-source" },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
