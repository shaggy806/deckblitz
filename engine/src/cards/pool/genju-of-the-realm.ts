import { defineCard } from "../define.js";

// Genju of the Cedars' shape: no colour is named, so the land keeps its own.
const ANIMATE = "{2}: Enchanted land becomes a legendary 8/12 Spirit creature with trample until end of turn. It's still a land.";
const RETURN = "When enchanted land is put into a graveyard, you may return Genju of the Realm from your graveyard to your hand.";

export default defineCard({
  name: "Genju of the Realm",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ANIMATE}\n${RETURN}`,
  targets: ["land"],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "become",
        target: "attached",
        power: 8,
        toughness: 12,
        addTypes: ["creature"],
        addSubtypes: ["Spirit"],
        addSupertypes: ["legendary"],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Genju of the Realm from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
