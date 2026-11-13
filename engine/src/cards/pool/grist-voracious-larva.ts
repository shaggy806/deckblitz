import { defineCard } from "../define.js";

const ENTER_TEXT =
  "Whenever Grist or another creature you control enters, if it entered from your graveyard or you cast it from your graveyard, you may pay {G}. If you do, exile Grist, then return it to the battlefield transformed under its owner's control.";

// EDHREC rank 4750. A card in your graveyard is one you own, so "your
// graveyard" is `ownedBy: "you"` beside where it came from (Prized
// Amalgam's shape); the "exile, then return transformed" is a `flicker`
// with `transformed` (Ral, Monsoon Mage).
export default defineCard({
  name: "Grist, Voracious Larva",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", ownedBy: "you", anyOf: [{ enteredFrom: "graveyard" }, { castFrom: "graveyard", castBy: "you" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G} to exile Grist, then return it transformed?",
        cost: "{G}",
        effect: { kind: "flicker", target: "source", transformed: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Grist, Voracious Larva", "Grist, the Plague Swarm"],
  transform: true,
});
