import { defineCard } from "../define.js";

// Mythos of Snapdax's bonus, unconditional: the caster answers each player's
// `choose-one-of-each`. Nothing is targeted, and one permanent may fill several
// slots (the rulings).
export default defineCard({
  name: "Tragic Arrogance",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "For each player, you choose from among the permanents that player controls an artifact, a creature, an enchantment, and a planeswalker. Then each player sacrifices all other nonland permanents they control.",
  targets: [],
  effect: {
    kind: "choose-one-of-each",
    who: "each-player",
    slots: ["artifact", "creature", "enchantment", "planeswalker"],
    filter: { notTypes: ["land"] },
    rest: "sacrifice",
    chooser: "you",
    prompt: "Choose an artifact, a creature, an enchantment, and a planeswalker for this player to keep — their other nonland permanents are sacrificed",
  },
});
