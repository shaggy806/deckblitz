import { defineCard } from "../define.js";

const ENTER_TEXT = "When this Vehicle enters, it becomes an artifact creature until end of turn.";
const RETURN_TEXT =
  "{2}{R}, Discard a card: Return this card from your graveyard to the battlefield with a finality counter on it. Activate only as a sorcery.";

export default defineCard({
  name: "Gastal Thrillroller",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 2,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${ENTER_TEXT}\nCrew 2\n${RETURN_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
    {
      cost: { mana: "{2}{R}", tap: false, discard: { count: 1 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
