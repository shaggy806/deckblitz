import { defineCard } from "../define.js";

// Spree: each mode its own additional cost. The third returns an Aura or
// Equipment card attached to a creature you control, chosen as it enters
// (`attachedTo: { among }`): an Aura with no creature of yours it can enchant
// stays in the graveyard (rule 303.4g), an Equipment with none enters
// unattached (301.5e).

const CREATURE_MODE = "+ {2} — Return target creature card from your graveyard to the battlefield.";
const MOUNT_MODE = "+ {1} — Return target Mount or Vehicle card from your graveyard to the battlefield.";
const AURA_MODE =
  "+ {1} — Return target Aura or Equipment card from your graveyard to the battlefield attached to a creature you control.";

export default defineCard({
  name: "One Last Job",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Spree (Choose one or more additional costs.)\n${CREATURE_MODE}\n${MOUNT_MODE}\n${AURA_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 3,
    modes: [
      {
        text: CREATURE_MODE,
        spreeCost: "{2}",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      {
        text: MOUNT_MODE,
        spreeCost: "{1}",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Mount", "Vehicle"] } }],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      {
        text: AURA_MODE,
        spreeCost: "{1}",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Aura", "Equipment"] } }],
        effect: {
          kind: "put-onto-battlefield",
          target: 0,
          attachedTo: { among: { type: "creature", controlledBy: "you" } },
        },
      },
    ],
  },
});
