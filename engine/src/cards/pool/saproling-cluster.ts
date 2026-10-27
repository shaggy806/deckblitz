import { defineCard } from "../define.js";

const TEXT = "{1}, Discard a card: Create a 1/1 green Saproling creature token. Any player may activate this ability.";

export default defineCard({
  name: "Saproling Cluster",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      // Whoever activates it pays the discard and creates the token (rule 602.2a).
      cost: { mana: "{1}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      anyPlayer: true,
      text: TEXT,
    },
  ],
});
