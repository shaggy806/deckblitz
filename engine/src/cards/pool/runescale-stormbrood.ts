import { defineCard } from "../define.js";

// EDHREC rank 10146.
// An omen card (rule 720): cast as Chilling Screech it's shuffled into its
// owner's library as it resolves. Chilling Screech is itself a noncreature
// spell, so an omen cast as its Omen counts.

const PUMP_TEXT =
  "Whenever you cast a noncreature spell or a Dragon spell, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Runescale Stormbrood",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ notTypes: ["creature"] }, { subtype: "Dragon" }] },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  faces: ["Runescale Stormbrood", "Chilling Screech"],
  omen: true,
});
