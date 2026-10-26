import { defineCard } from "../define.js";

// Betrayers of Kamigawa. EDHREC rank 26402.
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
//
// Genju of the Spires' shape, with Lavaclaw Reaches' granted pump ability on
// the animated land for the same turn.

const ANIMATE_TEXT =
  '{2}: Until end of turn, enchanted Swamp becomes a 2/2 black Spirit creature with "{B}: This creature gets +1/+1 until end of turn." It\'s still a land.';
const RETURN_TEXT =
  "When enchanted Swamp is put into a graveyard, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Genju of the Fens",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Swamp\n${ANIMATE_TEXT}\n${RETURN_TEXT}`,
  targets: [{ kind: "permanent", filter: { subtype: "Swamp" } }],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "attached",
            power: 2,
            toughness: 2,
            addTypes: ["creature"],
            addSubtypes: ["Spirit"],
            setColors: ["B"],
            duration: "end-of-turn",
          },
          {
            kind: "grant-activated",
            target: "attached",
            ability: {
              cost: { mana: "{B}", tap: false },
              targets: [],
              effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
              resolve: null,
              text: "{B}: This creature gets +1/+1 until end of turn.",
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "conditional",
        // "this card from your graveyard": only while it's in its owner's — your — graveyard.
        condition: {
          kind: "all",
          of: [
            { kind: "source-zone", zones: ["graveyard"] },
            { kind: "source", filter: { ownedBy: "you" } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Return Genju of the Fens from your graveyard to your hand?",
          effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
