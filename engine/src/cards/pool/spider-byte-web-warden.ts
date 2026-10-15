import { defineCard } from "../define.js";

const ETB_TEXT = "When Spider-Byte enters, return up to one target nonland permanent to its owner's hand.";

export default defineCard({
  name: "Spider-Byte, Web Warden",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Avatar", "Hero"],
  power: 2,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Not "another": Spider-Byte may return itself.
      targets: [{ kind: "optional", of: "nonland-permanent" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
