import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Rulebreaker is a deckbuilding rule only
// (`rulebreaker`, read by deck-validation.ts): the one extra colour is the
// deck's choice, so a deck is legal when one colour covers every instant and
// sorcery outside Tolabow's identity. The commander's own identity (what
// Command Tower makes) doesn't change.
const RULEBREAKER_TEXT =
  "Rulebreaker — If Tolabow, Loch Rascal is your commander, the color identity of instant and sorcery cards in your deck can include one color of your choice not in your commander's color identity, and your deck can have any basic land cards.";
const CAST_TEXT =
  "Whenever you cast an instant or sorcery spell, create a 1/1 blue and red Otter creature token with prowess. (Whenever you cast a noncreature spell, it gets +1/+1 until end of turn.)";

export default defineCard({
  name: "Tolabow, Loch Rascal",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Otter"],
  power: 3,
  toughness: 2,
  text: `${RULEBREAKER_TEXT}\n${CAST_TEXT}`,
  rulebreaker: {
    extraColorFor: ["instant", "sorcery"],
    anyIdentity: [{ supertypes: ["basic"], types: ["land"] }],
  },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "create-token", token: "Otter Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
