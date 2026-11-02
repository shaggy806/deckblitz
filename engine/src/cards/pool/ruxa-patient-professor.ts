import { defineCard } from "../define.js";

const RETURN_TEXT = "Whenever Ruxa enters or attacks, return target creature card with no abilities from your graveyard to your hand.";
const PUMP_TEXT = "Creatures you control with no abilities get +1/+1.";
const ASSIGN_TEXT = "For each creature you control with no abilities, you may have that creature assign its combat damage as though it weren't blocked.";

const NO_ABILITIES = { type: "creature", controlledBy: "you", hasAbilities: false } as const;
const RETURN = {
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", hasAbilities: false } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  resolve: null,
  text: RETURN_TEXT,
} as const;

export default defineCard({
  name: "Ruxa, Patient Professor",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear", "Druid"],
  supertypes: ["legendary"],
  power: 4,
  toughness: 4,
  text: `${RETURN_TEXT}\n${PUMP_TEXT}\n${ASSIGN_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, ...RETURN },
    { trigger: { on: "attacks", who: "self" }, ...RETURN },
  ],
  static: [
    { affects: { scope: "filter", filter: NO_ABILITIES }, grantPt: [1, 1], text: PUMP_TEXT },
    { affects: { scope: "filter", filter: NO_ABILITIES }, assignAsThoughUnblocked: true, text: ASSIGN_TEXT },
  ],
});
