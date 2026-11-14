import { defineCard } from "../define.js";

// EDHREC rank 15551.
const MANA_TEXT = "{T}: Add {G}{G}";
const TOKEN_TEXT = "{1}, {T}, Sacrifice this land: Create a tapped 4/4 green Troll Warrior creature token with trample.";
const GRANT_TEXT = `Enchanted Forest has '${MANA_TEXT}' and '${TOKEN_TEXT}'`;
const RETURN_TEXT = `When Old-Growth Troll dies, if it was a creature, return it to the battlefield. It's an Aura enchantment with enchant Forest you control and "${GRANT_TEXT}"`;

/**
 * Old-Growth Troll. It returns as an Aura enchantment (no other types or
 * subtypes) enchanting a Forest its controller chooses as it enters (rule
 * 303.4f) — under the control of whoever controlled it (the ruling) — and,
 * unlike Harold and Bob, keeps its own abilities: its trample does nothing
 * on a noncreature, and its dies trigger's "if it was a creature" fails, so
 * it comes back once.
 */
export default defineCard({
  name: "Old-Growth Troll",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        underYourControl: true,
        enterAs: {
          setTypes: ["enchantment"],
          enchant: { kind: "permanent", whose: "you", filter: { subtype: "Forest" } },
          static: [
            {
              affects: { scope: "attached" },
              grantsActivated: [
                {
                  cost: { mana: null, tap: true },
                  targets: [],
                  effect: { kind: "add-mana", mana: "G", amount: 2 },
                  resolve: null,
                  text: `${MANA_TEXT}.`,
                },
                {
                  cost: { mana: "{1}", tap: true, sacrifice: "self" },
                  targets: [],
                  effect: { kind: "create-token", token: "Troll Warrior Token", count: 1, tapped: true },
                  resolve: null,
                  text: TOKEN_TEXT,
                },
              ],
              text: GRANT_TEXT,
            },
          ],
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
