import { defineCard } from "../define.js";

// The lock stops the lands' controllers; Sharkey's copies are Sharkey's own
// abilities, so it doesn't reach them. A land ability naming its land means
// Sharkey (rule 201.5b) — Strip Mine's sacrifice is Sharkey's. "Mana of any
// type" pays even a {C} pip (rule 118.14).
const LOCK_TEXT = "Activated abilities of lands your opponents control can't be activated unless they're mana abilities.";
const GRANT_TEXT = "Sharkey has all activated abilities of lands your opponents control except mana abilities.";
const SPEND_TEXT = "Mana of any type can be spent to activate Sharkey's abilities.";

export default defineCard({
  name: "Sharkey, Tyrant of the Shire",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Rogue"],
  power: 2,
  toughness: 4,
  text: `${LOCK_TEXT}\n${GRANT_TEXT}\n${SPEND_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: {
        who: "each-player",
        abilitiesOf: { type: "land", controlledBy: "opponent" },
        exceptManaAbilities: true,
      },
      text: LOCK_TEXT,
    },
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "battlefield", filter: { type: "land", controlledBy: "opponent" }, except: "mana" },
      text: GRANT_TEXT,
    },
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-type", activating: "this" },
      text: SPEND_TEXT,
    },
  ],
});
