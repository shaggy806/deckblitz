import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 26024. Genju of the Cedars' shape.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.
//   [2009-10-01] Activating the ability that turns it into a creature while it's already a
//     creature will override any effects that set its power and/or toughness to a specific number.
//     However, any effect that raises or lowers power and/or toughness (such as the effect created
//     by Giant Growth, Glorious Anthem, or a +1/+1 counter) will continue to apply.

const ANIMATE = "{2}: Enchanted Island becomes a 3/2 blue Spirit creature with flying until end of turn. It's still a land.";
const RETURN = "When enchanted Island is put into a graveyard, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Genju of the Falls",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Island\n${ANIMATE}\n${RETURN}`,
  targets: [{ kind: "permanent", filter: { subtype: "Island" } }],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "attached",
        power: 3,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: ["Spirit"],
        setColors: ["U"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Genju of the Falls from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
