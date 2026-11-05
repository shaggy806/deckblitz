import { defineCard } from "../define.js";

// "Then you may attach an Equipment you control to him": the card the return
// put onto the battlefield (`"put-this-way"`, the new object — rule 400.7).

const PT_TEXT = "Winter Soldier gets +2/+0 for each Equipment attached to him.";
const RETURN_TEXT =
  "{3}{W}{B}: Return this card from your graveyard to the battlefield with a finality counter on him. Then you may attach an Equipment you control to him. (If a creature with a finality counter on it would die, exile it instead.)";

export default defineCard({
  name: "Winter Soldier, Icy Assassin",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Villain"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance", "menace"],
  text: `Vigilance, menace\n${PT_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Equipment", attachedTo: { isSource: true } }, pt: [2, 0] },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "finality", amount: 1 } },
          {
            kind: "attach",
            target: "put-this-way",
            choose: {
              filter: { subtype: "Equipment", controlledBy: "you" },
              prompt: "You may attach an Equipment you control to Winter Soldier",
              upTo: 1,
            },
          },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
