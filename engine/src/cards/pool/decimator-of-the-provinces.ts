import { defineCard } from "../define.js";

// EDHREC rank 9937.
//
// Rulings:
//   [2025-01-24] The mana value of a creature spell with emerge isn’t affected by whether its
//     emerge cost is paid. For example, if you cast Decimator of the Provinces for its emerge cost
//     and sacrifice a creature whose mana value is 3, Decimator of the Provinces’s mana value
//     remains 10.
//   [2025-01-24] The creature chosen to be sacrificed is still on the battlefield as the cost of
//     the emerge spell is determined and as you activate mana abilities to cast the emerge spell.
//     Its abilities may affect the spell’s cost, be activated to generate mana, and so on.
//     However, if it has an ability that triggers when a spell is cast, it will have been
//     sacrificed before that ability can trigger.
//   [2025-01-24] The triggered ability resolves before Decimator of the Provinces enters the
//     battlefield, so it won’t get +2/+2 from its own triggered ability.
//   [2025-01-24] You may sacrifice a creature with mana value greater than or equal to the emerge
//     cost. If you do, you’ll pay only the colored mana component of the emerge cost.
//   [2025-01-24] You may sacrifice a creature with a mana value of 0, such as a token creature
//     that’s not a copy of another permanent, to cast a spell for its emerge cost. You’ll just pay
//     the full emerge cost with no reduction.
//   [2025-01-24] An ability that triggers when a player casts a spell resolves before the spell
//     that caused it to trigger. It resolves even if that spell is countered or otherwise leaves
//     the stack without resolving.
//   [2025-01-24] Emerge represents two static abilities that function while the spell with emerge
//     is on the stack. “Emerge [cost]” means “You may cast this spell by paying [cost] and
//     sacrificing a creature rather than paying its mana cost” and “If you chose to pay this
//     spell’s emerge cost, its total cost is reduced by an amount of generic mana equal to the
//     sacrificed creature’s mana value.”
//   [2025-01-24] The set of creatures affected by the triggered ability is determined as the
//     ability resolves. Creatures you begin to control later in the turn won’t get +2/+2 or
//     trample.
//   [2025-01-24] A creature’s mana value is determined solely by the mana symbols printed in its
//     upper right corner (unless that creature is the back face of a double-faced card, is a
//     melded permanent, or is copying something else; see below). If the mana cost includes {X}, X
//     is 0. If it’s a single-faced card with no mana symbols in its upper right corner (because
//     it’s an animated land, for example), its mana value is 0. Ignore any alternative costs or
//     additional costs (such as kicker) that were paid as the creature was cast.
//   [2025-01-24] If you cast a spell for another cost “rather than paying its mana cost,” such as
//     an emerge cost, you can’t choose to cast it for any other alternative costs. You can,
//     however, pay additional costs, such as kicker costs. If the spell has any mandatory
//     additional costs, those must be paid to cast it.
//   [2025-01-24] If you sacrifice a creature with {X} in its mana cost, that X is 0.
//   [2025-01-24] The mana value of the back face of a double-faced card is the mana value of its
//     front face. The mana value of a melded permanent is the sum of the mana values of its front
//     faces. A creature that’s a copy of either has a mana value of 0.
//   [2025-01-24] Colored mana components of emerge costs can’t be reduced with emerge.
//   [2025-01-24] Once you begin to cast a spell with emerge, no player may take actions until
//     you’re done. Notably, opponents can’t try to remove the creature you wish to sacrifice.

export default defineCard({
  name: "Decimator of the Provinces",
  manaCost: "{10}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Boar"],
  power: 7,
  toughness: 7,
  keywords: ["trample", "haste"],
  emerge: { cost: "{6}{G}{G}{G}" },
  text: "Emerge {6}{G}{G}{G} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, creatures you control get +2/+2 and gain trample until end of turn.\nTrample, haste",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "When you cast this spell, creatures you control get +2/+2 and gain trample until end of turn.",
    },
  ],
});
