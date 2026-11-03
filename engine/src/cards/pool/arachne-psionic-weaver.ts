import { CARD_TYPE_CHOICES } from "../../effects.js";
import { defineCard, type StaticAbility } from "../define.js";

// EDHREC rank 11293.
//
// Rulings: land may technically be chosen, though lands are never cast (the
// card types of the rulings' list, less those no game here has); a subtype may
// not.
//
// Archon of Valor's Reach's shape: the type is a `chooseOnEnter` word, asked
// before Arachne moves, and one cost increase per type is live only for the
// type chosen. A spell of the type with other types too (an artifact creature)
// is still a spell of that type.

const TYPES = CARD_TYPE_CHOICES.filter((type) => type !== "creature");

const LOOK_TEXT = "As Arachne enters, look at an opponent's hand, then choose a card type other than creature.";
const COST_TEXT = "Spells of the chosen type cost {1} more to cast.";

const increase = (type: (typeof TYPES)[number]): StaticAbility => ({
  affects: { scope: "self" },
  condition: { kind: "chosen-on-enter", value: type },
  costModification: { applies: { type }, increaseGeneric: 1 },
  text: COST_TEXT,
});

export default defineCard({
  name: "Arachne, Psionic Weaver",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 3,
  toughness: 3,
  webSlinging: { cost: "{W}" },
  text: `Web-slinging {W} (You may cast this spell for {W} if you also return a tapped creature you control to its owner's hand.)\n${LOOK_TEXT}\n${COST_TEXT}`,
  chooseOnEnter: [...TYPES],
  chooseOnEnterLook: "opponent-hand",
  static: TYPES.map(increase),
});
