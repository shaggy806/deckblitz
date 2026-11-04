import { defineCard } from "../define.js";

// Final Fantasy. "A graveyard" reaches any player's; the spell is the caster's to
// control and its owner's still (rule 108.3). "Mana of any type" is for that cast
// alone (rule 118.14).
const ENTERS_TEXT =
  "Blue Magic — When Quistis Trepe enters, you may cast target instant or sorcery card from a graveyard, and mana of any type can be spent to cast that spell. If that spell would be put into a graveyard, exile it instead.";

export default defineCard({
  name: "Quistis Trepe",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  supertypes: ["legendary"],
  power: 2,
  toughness: 2,
  text: ENTERS_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "cast-now", target: 0, spendAs: "any-type", exileAfter: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
