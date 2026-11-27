import { defineCard } from "../define.js";

// Alara Reborn. EDHREC rank 23796. The second mode changes the game's rules
// for the turn (rule 611.2c), so it reaches permanents you come to control
// later in the turn too: Veilstone Amulet's one-shot `prohibit` of
// `be-targeted` (rules 601.2c, 115.1), only by spells (`only: "spells"`), only
// those an opponent controls (`by: "opponents"`), and only blue or black ones
// (`sourceFilter`, the spell's colours as it's cast or as it resolves, when
// its targets are checked again — 608.2b). Abilities aren't spells.

const MODE_DESTROY = "Destroy target blue or black noncreature permanent.";
const MODE_SHIELD =
  "Permanents you control can't be the targets of blue or black spells your opponents control this turn.";

export default defineCard({
  name: "Display of Dominance",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${MODE_DESTROY}\n• ${MODE_SHIELD}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: MODE_DESTROY,
        targets: [
          {
            kind: "permanent",
            filter: { notTypes: ["creature"], anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
          },
        ],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: MODE_SHIELD,
        targets: [],
        effect: {
          kind: "prohibit",
          prohibits: [
            {
              act: "be-targeted",
              object: { controlledBy: "you" },
              by: "opponents",
              only: "spells",
              sourceFilter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
            },
          ],
        },
      },
    ],
  },
});
