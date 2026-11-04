import { defineCard } from "../define.js";

// EDHREC rank 5329.
//
// Cataclysm's `choose-one-of-each`, among the nonland permanents: a land is
// neither chosen nor sacrificed, whatever else it is (the ruling), and a battle
// has no slot, so it goes. The Gearhulk goes too unless chosen.
const TEXT =
  "When this creature enters, each player chooses an artifact, a creature, an enchantment, and a planeswalker from among the nonland permanents they control, then sacrifices the rest.";

export default defineCard({
  name: "Cataclysmic Gearhulk",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-one-of-each",
        who: "each-player",
        slots: ["artifact", "creature", "enchantment", "planeswalker"],
        filter: { notTypes: ["land"] },
        rest: "sacrifice",
        prompt: "Choose an artifact, a creature, an enchantment, and a planeswalker to keep — your other nonland permanents are sacrificed",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
