import { defineCard } from "../define.js";

// EDHREC rank 27394.

export default defineCard({
  name: "Matsu-Tribe Birdstalker",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior", "Archer"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.\n{G}: This creature gains reach until end of turn. (It can block creatures with flying.)",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "reach", duration: "end-of-turn" },
      resolve: null,
      text: "{G}: This creature gains reach until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "tap", target: "trigger-recipient", doesntUntapNext: true },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
    },
  ],
});
