import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 17099.

export default defineCard({
  name: "Rimewind Cryomancer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: "{1}, {T}: Counter target activated ability. Activate only if you control four or more snow permanents. (Mana abilities can't be targeted.)",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      condition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 4 },
      targets: [{ kind: "ability", abilityKind: "activated" }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{1}, {T}: Counter target activated ability. Activate only if you control four or more snow permanents.",
    },
  ],
});
