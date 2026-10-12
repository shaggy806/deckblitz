import { defineCard } from "../define.js";

export default defineCard({
  name: "Jungleborn Pioneer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create a 1/1 blue Merfolk creature token with hexproof. (It can't be the target of spells or abilities your opponents control.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Token (Deeproot Waters)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 blue Merfolk creature token with hexproof.",
    },
  ],
});
