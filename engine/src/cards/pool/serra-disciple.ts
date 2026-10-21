import { defineCard } from "../define.js";

// EDHREC rank 23983. Jhoira, Weatherlight Captain's historic cast trigger.

const TEXT = "Whenever you cast a historic spell, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Serra Disciple",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "first-strike"],
  text: `Flying, first strike\n${TEXT} (Artifacts, legendaries, and Sagas are historic.)`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
