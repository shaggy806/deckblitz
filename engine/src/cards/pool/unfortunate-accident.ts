import { defineCard } from "../define.js";

// EDHREC rank 19228. Spree (rule 702.172a): a `spreeCost` on each mode.
const DESTROY_MODE = "+ {2}{B} — Destroy target creature.";
const TOKEN_MODE =
  '+ {1} — Create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';

export default defineCard({
  name: "Unfortunate Accident",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Spree (Choose one or more additional costs.)\n${DESTROY_MODE}\n${TOKEN_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: DESTROY_MODE,
        spreeCost: "{2}{B}",
        targets: ["creature"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: TOKEN_MODE,
        spreeCost: "{1}",
        effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      },
    ],
  },
});
