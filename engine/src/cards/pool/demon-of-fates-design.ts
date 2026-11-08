import { defineCard } from "../define.js";

export default defineCard({
  name: "Demon of Fate's Design",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nOnce during each of your turns, you may cast an enchantment spell by paying life equal to its mana value rather than paying its mana cost.\n{2}{B}, Sacrifice another enchantment: This creature gets +X/+0 until end of turn, where X is the sacrificed enchantment's mana value.",
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        filter: { type: "enchantment" },
        payLifeManaValue: true,
        oncePerTurn: true,
        when: { yourTurnOnly: true },
      },
      text: "Once during each of your turns, you may cast an enchantment spell by paying life equal to its mana value rather than paying its mana cost.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: { filter: { type: "enchantment", controlledBy: "you" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { manaValueOf: { paid: "sacrificed" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{B}, Sacrifice another enchantment: This creature gets +X/+0 until end of turn, where X is the sacrificed enchantment's mana value.",
    },
  ],
});
