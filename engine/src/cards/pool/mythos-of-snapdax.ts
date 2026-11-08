import { defineCard } from "../define.js";

// EDHREC rank 6751.
//
// {B}{R} spent means the caster answers each player's `choose-one-of-each`
// (`chosenBy`), under the same rules: a slot with a candidate must still be
// filled. A copy had no mana spent on it, so it never gets the bonus.
export default defineCard({
  name: "Mythos of Snapdax",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player chooses an artifact, a creature, an enchantment, and a planeswalker from among the nonland permanents they control, then sacrifices the rest. If {B}{R} was spent to cast this spell, you choose the permanents for each player instead.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { manaSpent: [{ type: "B", amount: { op: "gte", n: 1 } }, { type: "R", amount: { op: "gte", n: 1 } }] } },
    then: {
      kind: "choose-one-of-each",
      who: "each-player",
      slots: ["artifact", "creature", "enchantment", "planeswalker"],
      filter: { notTypes: ["land"] },
      rest: "sacrifice",
      chooser: "you",
      prompt: "Choose an artifact, a creature, an enchantment, and a planeswalker for this player to keep — their other nonland permanents are sacrificed",
    },
    else: {
      kind: "choose-one-of-each",
      who: "each-player",
      slots: ["artifact", "creature", "enchantment", "planeswalker"],
      filter: { notTypes: ["land"] },
      rest: "sacrifice",
      prompt: "Choose an artifact, a creature, an enchantment, and a planeswalker to keep — your other nonland permanents are sacrificed",
    },
  },
});
