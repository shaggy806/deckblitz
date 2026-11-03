import { defineCard } from "../define.js";

// EDHREC rank 19403.
//
// Rulings:
//   [2005-02-01] You may gain life when any creatures are declared as attackers, not just for
//     attacking creatures you control.
//   [2005-02-01] You may gain one life per attacking creature when the ability resolves during
//     each declare attackers step.

export default defineCard({
  name: "Patron of the Kitsune",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 6,
  kicker: { cost: "", keyword: "offering", flash: true, offering: { subtype: "Fox" } },
  text: "Fox offering (You may cast this spell any time you could cast an instant by sacrificing a Fox and paying the difference in mana costs between this and the sacrificed Fox. Mana cost includes color.)\nWhenever a creature attacks, you may gain 1 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: "Whenever a creature attacks, you may gain 1 life.",
    },
  ],
});
