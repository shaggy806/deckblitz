import { defineCard } from "../define.js";

// EDHREC rank 7980.
//
// Ascendant Spirit's shape: each ability checks his creature types as it
// resolves (a `conditional` on the source) and lasts indefinitely. "Becomes a
// Halfling Scout with base power and toughness 2/3" is `animate` (layer 7b);
// "becomes a Halfling Rogue" replaces only his creature types (`add-types`'
// `setSubtypes`). The granted trigger reads the Ring's count as it resolves.
//
// Rulings:
//   You can activate Frodo, Sauron's Bane's abilities regardless of what creature types it is.
//     Each of those abilities checks Frodo's creature types when that ability resolves. If Frodo,
//     Sauron's Bane isn't the appropriate creature type at the time, that ability does nothing.
//   None of these abilities have a duration. If one of them resolves, it will remain in effect
//     until the game ends, Frodo, Sauron's Bane leaves the battlefield, or some subsequent effect
//     changes its characteristics, whichever comes first.

const SCOUT_TEXT =
  "{W/B}{W/B}: If Frodo is a Citizen, it becomes a Halfling Scout with base power and toughness 2/3 and lifelink.";
const RING_TEXT =
  "Whenever this creature deals combat damage to a player, that player loses the game if the Ring has tempted you four or more times this game. Otherwise, the Ring tempts you.";
const ROGUE_TEXT = `{B}{B}{B}: If Frodo is a Scout, it becomes a Halfling Rogue with "${RING_TEXT}"`;

export default defineCard({
  name: "Frodo, Sauron's Bane",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 1,
  toughness: 2,
  text: `${SCOUT_TEXT}\n${ROGUE_TEXT}`,
  activated: [
    {
      cost: { mana: "{W/B}{W/B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Citizen" } },
        then: {
          kind: "animate",
          target: "source",
          power: 2,
          toughness: 3,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Halfling", "Scout"],
          keywords: ["lifelink"],
          duration: "permanent",
        },
      },
      resolve: null,
      text: SCOUT_TEXT,
    },
    {
      cost: { mana: "{B}{B}{B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Scout" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-types", target: "source", setSubtypes: ["Halfling", "Rogue"], duration: "permanent" },
            {
              kind: "grant-triggered",
              target: "source",
              duration: "permanent",
              ability: {
                trigger: { on: "deals-combat-damage-to-player", who: "self" },
                targets: [],
                effect: {
                  kind: "conditional",
                  condition: { kind: "ring-tempted", atLeast: 4 },
                  then: { kind: "lose-game", who: "trigger-player" },
                  else: { kind: "the-ring-tempts-you" },
                },
                resolve: null,
                text: RING_TEXT,
              },
            },
          ],
        },
      },
      resolve: null,
      text: ROGUE_TEXT,
    },
  ],
});
