import { defineCard } from "../define.js";

// EDHREC rank 16889. Coldsnap.

export default defineCard({
  name: "Heidar, Rimewind Master",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: "{2}, {T}: Return target permanent to its owner's hand. Activate only if you control four or more snow permanents.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      condition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 4 },
      targets: ["permanent"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{2}, {T}: Return target permanent to its owner's hand. Activate only if you control four or more snow permanents.",
    },
  ],
});
