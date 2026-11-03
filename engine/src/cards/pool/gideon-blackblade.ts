import { defineCard } from "../define.js";

// "That's still a planeswalker" (rule 205.1b): his card types stay, so damage
// would both be marked and take loyalty, and all of it is prevented on his
// controller's turn anyway. On any other turn he's only a planeswalker.

const ANIMATE =
  "During your turn, Gideon Blackblade is a 4/4 Human Soldier creature with indestructible that's still a planeswalker.";
const PREVENT = "Prevent all damage that would be dealt to Gideon Blackblade during your turn.";
const PLUS =
  "+1: Up to one other target creature you control gains your choice of vigilance, lifelink, or indestructible until end of turn.";
const MINUS = "−6: Exile target nonland permanent.";

export default defineCard({
  name: "Gideon Blackblade",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Gideon"],
  loyalty: 4,
  text: `${ANIMATE}\n${PREVENT}\n${PLUS}\n${MINUS}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      addTypes: ["creature"],
      addSubtypes: ["Human", "Soldier"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["indestructible"],
      text: ANIMATE,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self" },
      text: PREVENT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Vigilance", effect: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" } },
          { text: "Lifelink", effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" } },
          {
            text: "Indestructible",
            effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: ["nonland-permanent"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: MINUS,
    },
  ],
});
