import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

export default defineCard({
  name: "Gate Colossus",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 8,
  toughness: 8,
  text: "Affinity for Gates (This spell costs {1} less to cast for each Gate you control.)\nThis creature can't be blocked by creatures with power 2 or less.\nWhenever a Gate you control enters, you may put this card from your graveyard on top of your library.",
  selfCostReduction: affinity({ subtype: "Gate" }),
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Gate" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put Gate Colossus from your graveyard on top of your library?",
        effect: { kind: "put-on-library", target: "source", position: "top" },
      },
      resolve: null,
      text: "Whenever a Gate you control enters, you may put this card from your graveyard on top of your library.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
