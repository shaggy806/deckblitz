import { defineCard } from "../define.js";

// EDHREC rank 22679.
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

const ANIMATE = "{2}: Enchanted Forest becomes a 4/4 green Spirit creature until end of turn. It's still a land.";
const RETURN = "When enchanted Forest is put into a graveyard, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Genju of the Cedars",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Forest\n${ANIMATE}\n${RETURN}`,
  // Utopia Sprawl's Enchant Forest.
  targets: [{ kind: "permanent", filter: { subtype: "Forest" } }],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "attached",
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Spirit"],
        setColors: ["G"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
  triggered: [
    {
      // Viridian Harvest's trigger, with Angelic Destiny's return of the Aura
      // (by then in the graveyard too, put there as a state-based action).
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Genju of the Cedars from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
