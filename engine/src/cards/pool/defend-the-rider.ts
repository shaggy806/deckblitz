import { defineCard } from "../define.js";

// EDHREC rank 3258.
const PROTECT_TEXT = "Target permanent you control gains hexproof and indestructible until end of turn.";
const PILOT_TEXT =
  'Create a 1/1 colorless Pilot creature token with "This token saddles Mounts and crews Vehicles as though its power were 2 greater."';

export default defineCard({
  name: "Defend the Rider",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${PROTECT_TEXT}\n• ${PILOT_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: PROTECT_TEXT,
        targets: [{ kind: "permanent", whose: "you", filter: {} }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: PILOT_TEXT,
        targets: [],
        effect: { kind: "create-token", token: "Pilot Token", count: 1 },
      },
    ],
  },
});
