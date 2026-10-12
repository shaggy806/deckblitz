import { defineCard } from "../define.js";

// EDHREC rank 14489.
//
// "You may behold a Jace" is asked as it enters (rule 614.12): a Jace card
// from the hand or a Jace you control (an empowered Jace token too, 701.4a);
// declining, or with none, it enters tapped.
// Makes Jace → use "Jace Token".

export default defineCard({
  name: "Theorist's Sanctum",
  colors: [],
  types: ["land"],
  subtypes: ["Island"],
  text: "({T}: Add {U}.)\nAs this land enters, you may behold a Jace. If you don't, this land enters tapped. (To behold a Jace, choose a Jace you control or reveal a Jace card from your hand.)\n{2}{U}, {T}: Empower Jace 2.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      effect: { kind: "empower-jace", amount: 2 },
      resolve: null,
      text: "{2}{U}, {T}: Empower Jace 2.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnlessBehold: { filter: { subtype: "Jace" }, text: "a Jace" },
      },
      text: "As this land enters, you may behold a Jace. If you don't, this land enters tapped.",
    },
  ],
});
