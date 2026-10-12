import { defineCard } from "../define.js";

// EDHREC rank 8009.
//
// Your first spell with {X} in its mana cost this turn, wherever it falls
// among your spells — one cast before this was on the battlefield still
// counts, so a later one doesn't trigger it (the ruling). The copy keeps X,
// modes and any division (rule 707.10).
const COPY_TEXT =
  "Whenever you cast your first spell with {X} in its mana cost each turn, you may copy it. You may choose new " +
  "targets for the copy.";

export default defineCard({
  name: "Owlin Spiralmancer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${COPY_TEXT} (A copy of a permanent spell becomes a token.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true, filter: { xInManaCost: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell?",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
