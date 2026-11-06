import { defineCard } from "../define.js";


export default defineCard({
  name: "M'Ress, Crew Coordinator",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Caitian", "Officer"],
  power: 4,
  toughness: 4,
  text: "Landfall — Whenever a land you control enters, create two 1/1 red Officer creature tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 2 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, create two 1/1 red Officer creature tokens.",
    },
  ],
});
