import { defineCard } from "../define.js";

export default defineCard({
  name: "Knucklebone Witch",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: "Whenever a Goblin you control is put into a graveyard from the battlefield, you may put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { subtype: "Goblin" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Knucklebone Witch?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever a Goblin you control is put into a graveyard from the battlefield, you may put a +1/+1 counter on this creature.",
    },
  ],
});
