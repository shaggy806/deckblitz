import { defineCard } from "../define.js";

// EDHREC rank 11492.

export default defineCard({
  name: "Estrid, the Masked",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Estrid"],
  loyalty: 3,
  canBeCommander: true,
  text: "+2: Untap each enchanted permanent you control.\n−1: Create a white Aura enchantment token named Mask attached to another target permanent. The token has enchant permanent and umbra armor.\n−7: Mill seven cards. Return all non-Aura enchantment cards from your graveyard to the battlefield, then do the same for Aura cards.\nEstrid, the Masked can be your commander.",
  activated: [
    {
      // "Enchanted": an Aura attached, whoever controls it (the ruling).
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "untap-all", filter: { controlledBy: "you", enchanted: true } },
      resolve: null,
      text: "+2: Untap each enchanted permanent you control.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "other", of: "permanent" }],
      effect: { kind: "create-token", token: "Mask Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: "−1: Create a white Aura enchantment token named Mask attached to another target permanent. The token has enchant permanent and umbra armor.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 7 },
          {
            kind: "return-from-graveyard",
            filter: { type: "enchantment", notSubtypes: ["Aura"] },
            destination: "battlefield",
            count: "all",
          },
          {
            kind: "return-from-graveyard",
            filter: { type: "enchantment", subtype: "Aura" },
            destination: "battlefield",
            count: "all",
          },
        ],
      },
      resolve: null,
      text: "−7: Mill seven cards. Return all non-Aura enchantment cards from your graveyard to the battlefield, then do the same for Aura cards.",
    },
  ],
});
