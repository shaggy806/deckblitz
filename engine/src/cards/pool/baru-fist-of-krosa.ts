import { defineCard } from "../define.js";

// Future Sight (FUT).
//
// "Whenever a Forest enters" is any player's Forest. Grandeur is Korlash's
// shape: a discard cost filtered to cards with this name (the card on the
// battlefield isn't in hand, so any one there is "another"). X is the lands
// you control as the ability resolves, fixed as the token's base P/T (Kura's
// `basePt`).

const FOREST_TEXT =
  "Whenever a Forest enters, green creatures you control get +1/+1 and gain trample until end of turn.";
const GRANDEUR_TEXT =
  "Grandeur — Discard another card named Baru, Fist of Krosa: Create an X/X green Wurm creature token, where X is the number of lands you control.";
const GREEN_YOURS = { type: "creature", colors: ["G"], controlledBy: "you" } as const;
const LANDS = { countOf: { type: "land", controlledBy: "you" } } as const;

export default defineCard({
  name: "Baru, Fist of Krosa",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Druid"],
  power: 4,
  toughness: 4,
  text: `${FOREST_TEXT}\n${GRANDEUR_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { subtype: "Forest" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: GREEN_YOURS, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: GREEN_YOURS, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: FOREST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { name: "Baru, Fist of Krosa" } } },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Wurm Token (Baru, Fist of Krosa)",
        count: 1,
        basePt: { power: LANDS, toughness: LANDS },
      },
      resolve: null,
      text: GRANDEUR_TEXT,
    },
  ],
});
