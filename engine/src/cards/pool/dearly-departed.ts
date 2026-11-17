import { defineCard } from "../define.js";

// EDHREC rank 16203. The replacement works only from its owner's graveyard
// (`fromGraveyard`, rule 113.6b), for the Humans that player controls as
// they enter (rule 614.12); on the battlefield it does nothing. Each card
// there is a replacement of its own, so they add up (the ruling).
//
// Rulings:
//   [2011-09-22] The effect is cumulative. Human creatures you control will enter with a +1/+1
//     counter for each Dearly Departed in your graveyard.
//   [2011-09-22] In most cases, when determining whether a creature entering under your control
//     should get a +1/+1 counter, you'll simply look at what the creature will looklike on the
//     battlefield. You'll consider any effects affecting a creature entering under your control.

const GRAVEYARD_TEXT =
  "As long as this creature is in your graveyard, each Human creature you control enters with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Dearly Departed",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${GRAVEYARD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      fromGraveyard: true,
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", subtype: "Human", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: GRAVEYARD_TEXT,
    },
  ],
});
