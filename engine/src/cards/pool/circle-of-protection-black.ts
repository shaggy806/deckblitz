import { defineCard } from "../define.js";

// EDHREC rank 20801. "A black source of your choice" is chosen as the ability
// resolves, among the black permanents and spells on the stack (rule 609.7a);
// it can be activated with nothing to prevent, and the shield is checked
// again for the colour when the damage would be dealt (609.7b).

const TEXT = "{1}: The next time a black source of your choice would deal damage to you this turn, prevent that damage.";

export default defineCard({
  name: "Circle of Protection: Black",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", filter: { colors: ["B"] }, to: "you", amount: "next-time" },
      resolve: null,
      text: TEXT,
    },
  ],
});
