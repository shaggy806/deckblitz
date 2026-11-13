import { defineCard } from "../define.js";

// EDHREC 3505 (batch 315). The noted type is the one mana spent on the first
// ability's cost (W, U, B, R, G or C — its ruling), kept on the artifact
// (`note`'s `manaTypeSpent`) and read back by the mana ability's
// `"chosen"`. A charge counter put on another way still makes mana of the
// last noted type (its ruling); with nothing ever noted, none. A new object
// (rule 400.7) has noted nothing.
const CHARGE_TEXT =
  "{1}, {T}: Put a charge counter on this artifact. Note the type of mana spent to pay this activation cost. Activate only if there are no charge counters on this artifact.";
const MANA_TEXT = "{T}, Remove a charge counter from this artifact: Add one mana of this artifact's last noted type.";

export default defineCard({
  name: "Jeweled Amulet",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE_TEXT}\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      condition: { kind: "self-counters", counter: "charge", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
          { kind: "note", manaTypeSpent: true },
        ],
      },
      resolve: null,
      text: CHARGE_TEXT,
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
