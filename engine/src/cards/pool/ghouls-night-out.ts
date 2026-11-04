import { defineCard } from "../define.js";

// Rulings: the creatures enter simultaneously and see each other enter; one
// that enters as a noncreature won't be a Zombie but still gains decayed. It
// enters black whatever else it is. Chosen as this resolves, none a target.
const TEXT =
  "For each player, choose a creature card in that player's graveyard. Put those cards onto the battlefield under your control. They're black Zombies in addition to their other colors and types and they gain decayed. (A creature with decayed can't block. When it attacks, sacrifice it at end of combat.)";

export default defineCard({
  name: "Ghouls' Night Out",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "for-each-player",
    who: "each-player",
    choicesHeld: true,
    effect: {
      kind: "look-and-choose",
      zone: "graveyard",
      from: "that-player",
      filter: { type: "creature" },
      min: 1,
      max: 1,
      destination: "battlefield",
      leftover: "stay",
      enterAs: { addColors: ["B"], addSubtypes: ["Zombie"], keywords: ["decayed"] },
    },
  },
});
