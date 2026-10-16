import { defineCard } from "../define.js";

// EDHREC rank 20641. Modern Horizons 3.
//
// "You may pay {E}{E}. When you do, choose one —" is a `may` with
// `costEnergy` whose effect is a reflexive ability (rule 603.12) — its mode
// chosen as it goes on the stack (rule 700.2b, an `announced` modal: Caesar,
// Legion's Emperor's shape), so players respond knowing it.

const ENTER_TEXT = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const COMBAT_TEXT = "At the beginning of combat on your turn, you may pay {E}{E}. When you do, choose one —";
const SELF_MODE = "This creature gains vigilance and lifelink until end of turn.";
const TEAM_MODE = "Other creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Voltstorm Angel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${COMBAT_TEXT}\n• ${SELF_MODE}\n• ${TEAM_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to choose a mode (vigilance and lifelink for this creature, or +1/+1 for your others)?",
        costEnergy: 2,
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: {
            kind: "modal",
            announced: true,
            minModes: 1,
            maxModes: 1,
            modes: [
              {
                text: SELF_MODE,
                effect: {
                  kind: "sequence",
                  effects: [
                    { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
                    { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
                  ],
                },
              },
              {
                text: TEAM_MODE,
                effect: {
                  kind: "modify-pt-all",
                  filter: { type: "creature", controlledBy: "you" },
                  power: 1,
                  toughness: 1,
                  duration: "end-of-turn",
                  exceptSource: true,
                },
              },
            ],
          },
          text: `When you do, choose one — • ${SELF_MODE} • ${TEAM_MODE}`,
        },
      },
      resolve: null,
      text: `${COMBAT_TEXT} • ${SELF_MODE} • ${TEAM_MODE}`,
    },
  ],
});
