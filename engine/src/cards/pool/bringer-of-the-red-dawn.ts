import { defineCard } from "../define.js";

// EDHREC rank 20322.
//
// The upkeep trigger is Threaten's effect behind a `may`: the target is chosen
// as the trigger goes on the stack, the choice to untap and steal it as it
// resolves.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may untap target creature and gain control of it until end of turn. That creature gains haste until end of turn.";

export default defineCard({
  name: "Bringer of the Red Dawn",
  manaCost: "{7}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bringer"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  alternativeCost: { mana: "{W}{U}{B}{R}{G}" },
  text: `You may pay {W}{U}{B}{R}{G} rather than pay this spell's mana cost.\nTrample\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Untap the creature and gain control of it until end of turn?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: 0 },
            { kind: "gain-control", target: 0, untilEndOfTurn: true },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
