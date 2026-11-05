import { defineCard } from "../define.js";

export default defineCard({
  name: "Ajani, Nacatl Pariah",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 1,
  toughness: 2,
  text: "When Ajani enters, create a 2/1 white Cat Warrior creature token.\nWhenever one or more other Cats you control die, you may exile Ajani, then return him to the battlefield transformed under his owner's control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Cat Warrior Token (Ajani Fells the Godsire)", count: 1 },
      resolve: null,
      text: "When Ajani enters, create a 2/1 white Cat Warrior creature token.",
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { subtype: "Cat", type: "creature" },
        otherOnly: true,
        batched: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Ajani, Nacatl Pariah, then return him to the battlefield transformed under his owner's control?",
        effect: { kind: "flicker", target: "source", transformed: true },
      },
      resolve: null,
      text: "Whenever one or more other Cats you control die, you may exile Ajani, then return him to the battlefield transformed under his owner's control.",
    },
  ],
  faces: ["Ajani, Nacatl Pariah", "Ajani, Nacatl Avenger"],
  transform: true,
});
