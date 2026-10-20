import { defineCard } from "../define.js";

// EDHREC rank 12273.
//
// Each {S} is one mana from a snow source (rule 107.4h). None of the
// abilities has a duration: what one does lasts until this leaves the
// battlefield or something later changes it (the rulings). The first two
// overwrite its creature types and base power and toughness, keeping its card
// types and supertypes; counters and pumps still apply over the base P/T.
// Each time the last resolves while it's an Angel it gets two more counters
// and another instance of the trigger (the rulings).
const WARRIOR_TEXT = "{S}{S}: This creature becomes a Spirit Warrior with base power and toughness 2/3.";
const ANGEL_TEXT =
  "{S}{S}{S}: If this creature is a Warrior, put a flying counter on it and it becomes a Spirit Warrior Angel with base power and toughness 4/4.";
const DRAW_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";
const CARDS_TEXT = `{S}{S}{S}{S}: If this creature is an Angel, put two +1/+1 counters on it and it gains "${DRAW_TEXT}"`;

export default defineCard({
  name: "Ascendant Spirit",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: `${WARRIOR_TEXT}\n${ANGEL_TEXT}\n${CARDS_TEXT}`,
  activated: [
    {
      cost: { mana: "{S}{S}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 3,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Spirit", "Warrior"],
        duration: "permanent",
      },
      resolve: null,
      text: WARRIOR_TEXT,
    },
    {
      cost: { mana: "{S}{S}{S}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Warrior" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "flying", amount: 1 },
            {
              kind: "animate",
              target: "source",
              power: 4,
              toughness: 4,
              addTypes: [],
              addSubtypes: [],
              setSubtypes: ["Spirit", "Warrior", "Angel"],
              duration: "permanent",
            },
          ],
        },
      },
      resolve: null,
      text: ANGEL_TEXT,
    },
    {
      cost: { mana: "{S}{S}{S}{S}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Angel" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
            {
              kind: "grant-triggered",
              target: "source",
              duration: "permanent",
              ability: {
                trigger: { on: "deals-combat-damage-to-player", who: "self" },
                targets: [],
                effect: { kind: "draw", amount: 1 },
                resolve: null,
                text: DRAW_TEXT,
              },
            },
          ],
        },
      },
      resolve: null,
      text: CARDS_TEXT,
    },
  ],
});
