import { defineCard } from "../define.js";

// EDHREC rank 18631.
//
// A cast trigger's X is the X of the spell that was cast (`Game.triggerCastX`),
// fixed as it was cast — so "copy it X times" copies it that many times even
// if the spell is countered in response, each copy asked about new targets in
// turn. The copies weren't cast, so they don't trigger this again.
const COPY_TEXT = "When you cast this spell, copy it X times. You may choose new targets for the copies.";

export default defineCard({
  name: "Photon Blast Barrage",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\nPhoton Blast Barrage deals 1 damage to target creature.`,
  targets: ["creature"],
  effect: { kind: "damage", amount: 1, target: 0 },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: "x" },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
