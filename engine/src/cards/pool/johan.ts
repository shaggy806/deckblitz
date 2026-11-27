import { defineCard } from "../define.js";

// EDHREC rank 26044.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may have Johan gain \"Johan can't attack\" until end of combat. If you do, attacking doesn't cause creatures you control to tap this combat if Johan is untapped.";

export default defineCard({
  name: "Johan",
  manaCost: "{3}{R}{G}{W}",
  colors: ["R", "G", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 5,
  toughness: 4,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Johan gain \"Johan can't attack\" until end of combat, so attacking doesn't tap your creatures while it's untapped?",
        effect: {
          kind: "sequence",
          effects: [
            // The quoted ability, gained until end of combat.
            {
              kind: "grant-static",
              target: "source",
              ability: { affects: { scope: "self" }, restrictions: ["cant-attack"], text: "Johan can't attack." },
              duration: "until-end-of-combat",
            },
            // "If you do": the rule for this combat, asked of Johan as the
            // attackers are declared (rule 508.1f) — not a gained ability,
            // so it lasts whatever becomes of Johan's.
            {
              kind: "player-effect",
              duration: "until-end-of-combat",
              attacksWithoutTapping: {
                filter: { type: "creature", controlledBy: "you" },
                whileUntapped: "source",
              },
            },
          ],
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
