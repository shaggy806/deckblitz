import { defineCard } from "../define.js";

const ANIMATE_TEXT = "{2}: Enchanted Mountain becomes a 6/1 red Spirit creature until end of turn. It's still a land.";
const RETURN_TEXT =
  "When enchanted Mountain is put into a graveyard, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Genju of the Spires",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Mountain\n${ANIMATE_TEXT}\n${RETURN_TEXT}`,
  targets: [{ kind: "permanent", filter: { subtype: "Mountain" } }],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "attached",
        power: 6,
        toughness: 1,
        addTypes: ["creature"],
        addSubtypes: ["Spirit"],
        setColors: ["R"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "conditional",
        // "this card from your graveyard": only while it's in its owner's — your — graveyard.
        condition: {
          kind: "all",
          of: [
            { kind: "source-zone", zones: ["graveyard"] },
            { kind: "source", filter: { ownedBy: "you" } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Return Genju of the Spires from your graveyard to your hand?",
          effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
