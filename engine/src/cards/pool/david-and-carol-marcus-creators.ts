import { defineCard } from "../define.js";

const TEXT =
  "When David and Carol Marcus enter, create a tapped Planet land token named New Planet with \"{T}: Add one mana of any color.\"";

export default defineCard({
  name: "David and Carol Marcus, Creators",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
