import { defineCard } from "../define.js";

const PT_TEXT = "Titania's power and toughness are each equal to the number of lands you control.";
const ENTER_TEXT = "When Titania enters, return all land cards from your graveyard to the battlefield tapped.";
const ANIMATE_TEXT =
  "{3}{G}: Put four +1/+1 counters on target land you control. It becomes a 0/0 Elemental creature with haste. It's still a land.";

// The melded back face of Argoth, Sanctum of Nature and Titania, Voice of Gaea
// (rule 712.4): never a card of its own.
export default defineCard({
  name: "Titania, Gaea Incarnate",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Avatar"],
  power: 0,
  toughness: 0,
  keywords: ["reach", "vigilance", "trample", "haste"],
  meldOf: ["Argoth, Sanctum of Nature", "Titania, Voice of Gaea"],
  text: `Reach, vigilance, trample, haste\n${PT_TEXT}\n${ENTER_TEXT}\n${ANIMATE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { type: "land" },
        destination: "battlefield",
        count: "all",
        enterTapped: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: ["land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 },
          {
            kind: "become",
            target: 0,
            power: 0,
            toughness: 0,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            keywords: ["haste"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
