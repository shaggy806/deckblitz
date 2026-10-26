import { defineCard } from "../define.js";

// EDHREC rank 27308.

export default defineCard({
  name: "Molder Beast",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nWhenever an artifact is put into a graveyard from the battlefield, this creature gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever an artifact is put into a graveyard from the battlefield, this creature gets +2/+0 until end of turn.",
    },
  ],
});
