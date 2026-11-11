import { defineCard } from "../define.js";

// EDHREC rank 8639.
//
// "Historic permanent card": an artifact, legendary or Saga card that isn't an
// instant or sorcery. "…if it's a creature" is the counters' `ifCreature`,
// judged as the permanent exists on the battlefield (rule 614.12).

const BURN = "Let the World Burn — Destroy all artifacts and creatures.";
const JUNO =
  "Release Juno — Return target historic permanent card from your graveyard to the battlefield. It enters with two additional +1/+1 counters on it if it's a creature. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "What Must Be Done",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Choose one —\n• ${BURN}\n• ${JUNO}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: BURN,
        targets: [],
        effect: { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      {
        text: JUNO,
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: {
              notTypes: ["instant", "sorcery"],
              anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }],
            },
          },
        ],
        effect: {
          kind: "put-onto-battlefield",
          target: 0,
          withCounters: { kind: "+1/+1", amount: 2, ifCreature: true },
        },
      },
    ],
  },
});
