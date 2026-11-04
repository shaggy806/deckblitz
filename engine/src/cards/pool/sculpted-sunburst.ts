import { defineCard } from "../define.js";

// Nothing is targeted and every choice is made as it resolves (the ruling): you
// first, then each opponent from the active player (rule 101.4), each among what's
// no stronger than the creature you chose. An opponent with nothing that small
// chooses nothing, and loses every creature they control. With no creature of
// yours chosen, nothing is exiled (the ruling).
export default defineCard({
  name: "Sculpted Sunburst",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Choose a creature you control, then each opponent chooses a creature they control with equal or lesser power. " +
    "If you chose a creature this way, exile each creature not chosen by any player this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: "you",
        for: { permanent: { type: "creature", controlledBy: "you" }, own: true, keep: true },
      },
      {
        kind: "vote",
        choose: true,
        who: "each-opponent",
        for: {
          permanent: { type: "creature", controlledBy: "you", power: { op: "lte", n: { chosenThisWay: "power" } } },
          own: true,
          keep: true,
        },
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "chosen", who: "you" },
        then: { kind: "exile-all", filter: { type: "creature", notThisWay: "chosen" } },
      },
    ],
  },
});
