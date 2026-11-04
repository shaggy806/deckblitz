import { defineCard } from "../define.js";

const REPLACE_TEXT = "If you would proliferate, proliferate twice instead.";
const ACTIVATED_TEXT =
  "{1}{U/P}{U/P}, Remove three counters from among other artifacts, creatures, and planeswalkers you control: Put an indestructible counter on Tekuthal. ({U/P} can be paid with either {U} or 2 life.)";

export default defineCard({
  name: "Tekuthal, Inquiry Dominus",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Phyrexian", "Horror"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${REPLACE_TEXT}\n${ACTIVATED_TEXT}`,
  static: [{ affects: { scope: "self" }, replacement: { event: "would-proliferate", times: 2 }, text: REPLACE_TEXT }],
  activated: [
    {
      cost: {
        mana: "{1}{U/P}{U/P}",
        tap: false,
        removeCounter: {
          kind: "any",
          count: 3,
          from: { typesAnyOf: ["artifact", "creature", "planeswalker"] },
          excludeSource: true,
          among: true,
        },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "indestructible", amount: 1 },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
