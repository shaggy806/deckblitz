import { defineCard } from "../define.js";

const EXILE_TEXT = "{2}, {T}: Exile target creature you control.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may sacrifice this land. If you do, return each card exiled with this land to the battlefield under its owner's control.";

// The creatures are exiled *with* the Haven (rule 607.2a), so only this
// Haven's cards come back, together, each under its owner's control (the
// rulings), and only if it was sacrificed. A token exiled ceases to exist.
export default defineCard({
  name: "Safe Haven",
  colors: [],
  types: ["land"],
  text: `${EXILE_TEXT}\n${UPKEEP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Safe Haven and return the cards exiled with it?",
        effect: { kind: "sacrifice-source", then: { kind: "return-exiled-by-source", linked: "battlefield" } },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
