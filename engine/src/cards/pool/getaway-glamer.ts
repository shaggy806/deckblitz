import { defineCard } from "../define.js";

// Spree (rule 702.172a), its modes followed in printed order. "If no other
// creature has greater power" is read as the mode resolves, about the target,
// and a tie destroys it.
const EXILE_TEXT =
  "+ {1} — Exile target nontoken creature. Return it to the battlefield under its owner's control at the beginning of the next end step.";
const DESTROY_TEXT = "+ {2} — Destroy target creature if no other creature has greater power.";

export default defineCard({
  name: "Getaway Glamer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Spree (Choose one or more additional costs.)\n${EXILE_TEXT}\n${DESTROY_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: EXILE_TEXT,
        spreeCost: "{1}",
        targets: [{ kind: "permanent", filter: { type: "creature", token: false } }],
        effect: {
          kind: "flicker",
          target: 0,
          returnAt: { step: "end" },
          returnText: "Return the exiled card to the battlefield under its owner's control.",
        },
      },
      {
        text: DESTROY_TEXT,
        spreeCost: "{2}",
        targets: ["creature"],
        effect: {
          kind: "conditional",
          condition: {
            kind: "target",
            index: 0,
            filter: { greatestInZone: { of: "power", among: { type: "creature" } } },
          },
          then: { kind: "destroy", target: 0 },
        },
      },
    ],
  },
});
