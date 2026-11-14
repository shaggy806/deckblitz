import { defineCard } from "../define.js";

// EDHREC rank 10022. "An ability of an artifact they control": the activating
// player's own artifact (`sourceControlledByActivator`), a mana ability
// included — the card doesn't exclude one (`orMana`).

const CDA_TEXT = "Avalanche of Sector 7's power is equal to the number of artifacts your opponents control.";
const TRIGGER_TEXT =
  "Whenever an opponent activates an ability of an artifact they control, Avalanche of Sector 7 deals 1 damage to that player.";

export default defineCard({
  name: "Avalanche of Sector 7",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 0,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${CDA_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "artifact", controlledBy: "opponent" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "activates-ability",
        who: "opponent",
        source: { type: "artifact" },
        sourceControlledByActivator: true,
        orMana: true,
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
