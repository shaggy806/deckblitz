import { defineCard } from "../define.js";

// EDHREC rank 14154.

export default defineCard({
  name: "Storm, Windrider",
  manaCost: "{1}{G}{W}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nCreatures with flying can't attack you or block creatures you control.\nWhenever you cast a spell that targets one or more creatures, those creatures gain flying until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { permanent: { type: "creature" } } } },
      targets: [],
      effect: { kind: "grant-keyword-all", filter: { type: "creature", inSet: { targetsOf: "trigger-object" } }, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a spell that targets one or more creatures, those creatures gain flying until end of turn.",
    },
  ],
  static: [
    { affects: { scope: "filter", filter: { type: "creature", keyword: "flying" } }, restrictions: [{ kind: "cant-attack", at: "you" }], text: "Creatures with flying can't attack you or block creatures you control." },
    { affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } }, restrictions: [{ kind: "cant-be-blocked", by: { keyword: "flying" } }], text: "Creatures with flying can't attack you or block creatures you control." },
  ],
});
