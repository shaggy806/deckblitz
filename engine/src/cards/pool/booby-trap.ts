import { defineCard } from "../define.js";

// The opponent and the name are both chosen as it enters (rule 614.12); the
// chosen player's draws are revealed, so the trigger reads a public card, and
// "if you do" is the sacrifice the damage hangs on — dealt by the artifact as
// it last existed.
const ENTERS = "As this artifact enters, choose an opponent and a card name other than a basic land card name.";
const REVEAL = "The chosen player reveals each card they draw.";
const DRAWS =
  "When the chosen player draws a card with the chosen name, sacrifice this artifact. If you do, this artifact " +
  "deals 10 damage to that player.";

export default defineCard({
  name: "Booby Trap",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS}\n${REVEAL}\n${DRAWS}`,
  choosePlayerOnEnter: "opponent",
  chooseCardNameOnEnter: { filter: { notBasicLand: true }, aim: "opponent-library" },
  static: [{ affects: { scope: "self" }, revealsDraws: "chosen-player", text: REVEAL }],
  triggered: [
    {
      trigger: { on: "draws", who: "chosen-player", filter: { chosenName: true } },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: { kind: "damage", amount: 10, who: "trigger-controller" },
      },
      resolve: null,
      text: DRAWS,
    },
  ],
});
