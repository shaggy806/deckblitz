import { defineCard } from "../define.js";

// EDHREC rank 4462.
export default defineCard({
  name: "Malevolent Hermit",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  disturb: { cost: "{2}{U}" },
  text: "{U}, Sacrifice this creature: Counter target noncreature spell unless its controller pays {3}.\nDisturb {2}{U} (You may cast this card from your graveyard transformed for its disturb cost.)",
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: ["noncreature-spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "{U}, Sacrifice this creature: Counter target noncreature spell unless its controller pays {3}.",
    },
  ],
  faces: ["Malevolent Hermit", "Benevolent Geist"],
  transform: true,
});
