import { defineCard } from "../define.js";

// The equipped creature has the quoted static (`grantsStatic`): its "you" is
// that creature's controller (rule 113.10), whoever controls the Kirin.

const GRANT = "Equipped creature has flying and \"You can't lose the game and your opponents can't win the game.\"";
const RECONFIGURE =
  "Reconfigure {5} ({5}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)";

export default defineCard({
  name: "Cloudsteel Kirin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Kirin"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${GRANT}\n${RECONFIGURE}`,
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      grantsStatic: [
        {
          affects: { scope: "self" },
          cantLoseGame: true,
          opponentsCantWinGame: true,
          text: "You can't lose the game and your opponents can't win the game.",
        },
      ],
      text: GRANT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {5}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {5}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
});
