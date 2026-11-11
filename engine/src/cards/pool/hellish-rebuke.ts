import { defineCard } from "../define.js";

// Rulings:
//   [2021-07-23] If a spell or ability causes another player to gain control of Hellish Rebuke
//     while it is on the stack, permanents controlled by the opponents of that player will gain
//     the ability. However, you're still the player that cast Hellish Rebuke, so the ability will
//     trigger whenever one of those permanents deals damage to you.
//   [2021-07-23] Copies of Hellish Rebuke that weren't cast will give opponents' permanents the
//     ability, but that ability won't do anything because no player cast that copy.
//
// The grant fixes its permanents as it resolves (rule 611.2c) and writes who
// cast the spell into the granted trigger (`to: "spell-caster"`). "You" in
// the granted ability is the permanent's controller.

const GRANTED = "When this permanent deals damage to the player who cast Hellish Rebuke, sacrifice this permanent. You lose 2 life.";

export default defineCard({
  name: "Hellish Rebuke",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Until end of turn, permanents your opponents control gain "${GRANTED}"`,
  targets: [],
  effect: {
    kind: "grant-triggered-all",
    filter: { controlledBy: "opponent" },
    duration: "end-of-turn",
    ability: {
      trigger: { on: "deals-damage", who: "self", to: "spell-caster" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "sacrifice-source" }, { kind: "lose-life", amount: 2 }],
      },
      resolve: null,
      text: GRANTED,
    },
  },
});
