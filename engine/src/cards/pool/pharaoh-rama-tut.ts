import { defineCard } from "../define.js";

export default defineCard({
  name: "Pharaoh Rama-Tut",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Villain"],
  power: 4,
  toughness: 4,
  text: "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nWhenever you cast a noncreature spell, Pharaoh Rama-Tut connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, Pharaoh Rama-Tut connives.",
    },
  ],
});
