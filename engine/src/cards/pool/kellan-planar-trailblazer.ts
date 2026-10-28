import { defineCard } from "../define.js";

// EDHREC rank 12460.
//
// Each ability checks his creature types as it resolves (the rulings: a
// `conditional` on the source) and has no duration. "Becomes a Human Faerie
// Detective" replaces his creature types and nothing else (`add-types`'
// `setSubtypes`); "becomes a 3/2 Human Faerie Rogue" sets his base P/T too
// (`animate`, layer 7b at its timestamp — the first ruling).
//
// Rulings:
//   Neither of these abilities have durations. If one of them resolves, it will remain in effect
//     until the game ends, Kellan leaves the battlefield, or some subsequent effect changes its
//     characteristics, whichever comes first.
//   Kellan's abilities overwrite its existing creature types. For example, once Kellan's first
//     ability resolves, if he was a Scout when it resolved, Kellan will be a Human Faerie
//     Detective. He won't have the Scout creature type.
//   You can activate Kellan's abilities regardless of what creature types he currently has. Each
//     ability checks Kellan's creature types when it resolves. If Kellan doesn't have the
//     appropriate creature type at that time, the ability will do nothing.

const DETECTIVE_TEXT =
  '{1}{R}: If Kellan is a Scout, it becomes a Human Faerie Detective and gains "Whenever Kellan deals combat damage to a player, exile the top card of your library. You may play that card this turn."';
const ROGUE_TEXT = "{2}{R}: If Kellan is a Detective, it becomes a 3/2 Human Faerie Rogue and gains double strike.";

export default defineCard({
  name: "Kellan, Planar Trailblazer",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Faerie", "Scout"],
  power: 2,
  toughness: 1,
  text: `${DETECTIVE_TEXT}\n${ROGUE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Scout" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-types", target: "source", setSubtypes: ["Human", "Faerie", "Detective"], duration: "permanent" },
            {
              kind: "grant-triggered",
              target: "source",
              duration: "permanent",
              ability: {
                trigger: { on: "deals-combat-damage-to-player", who: "self" },
                targets: [],
                effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
                resolve: null,
                text: "Whenever Kellan deals combat damage to a player, exile the top card of your library. You may play that card this turn.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: DETECTIVE_TEXT,
    },
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Detective" } },
        then: {
          kind: "animate",
          target: "source",
          power: 3,
          toughness: 2,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Human", "Faerie", "Rogue"],
          keywords: ["double-strike"],
          duration: "permanent",
        },
      },
      resolve: null,
      text: ROGUE_TEXT,
    },
  ],
});
