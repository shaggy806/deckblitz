import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Kaldheim (KHM). EDHREC rank 13948. The {3}{U} is paid as the trigger
// resolves (the ruling) — a `may` with a cost — and the Giant Wizard is made
// and the Amulet attached to it in that one resolution (Midnight Angel
// Armor's shape). The granted "hexproof as long as it's untapped" reads the
// equipped creature's own tapped state.
const ENTERS_TEXT =
  "When this Equipment enters, you may pay {3}{U}. If you do, create a 4/4 blue Giant Wizard creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT =
  "Equipped creature gets +0/+1 and has \"This creature has hexproof as long as it's untapped.\"";

export default defineCard({
  name: "Giant's Amulet",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT} (It can't be the target of spells or abilities your opponents control.)\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3}{U} to create a 4/4 Giant Wizard and attach this Equipment to it?",
        cost: "{3}{U}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Giant Wizard Token", count: 1 },
            { kind: "attach", target: "created", attachment: "source" },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [0, 1], text: EQUIPPED_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { tapped: false } } },
      grantKeywords: ["hexproof"],
      text: "This creature has hexproof as long as it's untapped.",
    },
  ],
  activated: [equip("{2}")],
});
