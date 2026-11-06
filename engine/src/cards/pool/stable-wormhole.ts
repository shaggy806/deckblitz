import { defineCard } from "../define.js";

// EDHREC rank 28355.

const TEXT =
  'Whenever you attack, create a tapped Planet land token named New Planet with "{T}: Add one mana of any color."';

export default defineCard({
  name: "Stable Wormhole",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
