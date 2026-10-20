import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const WARD_TEXT = "Each creature you control has ward {1}.";

/** The disturb back face of Chaplain of Alms. A granted ward is a real
 * triggered ability on each creature (Cathedral Acolyte's shape). */
export default defineCard({
  name: "Chapel Shieldgeist",
  art: "https://cards.scryfall.io/art_crop/back/2/0/20e94e17-2e4c-41cd-8cc5-39ab41037287.jpg",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "first-strike"],
  text: `Flying, first strike\n${WARD_TEXT} (Whenever it becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\nIf Chapel Shieldgeist would be put into a graveyard from anywhere, exile it instead.`,
  faces: ["Chaplain of Alms", "Chapel Shieldgeist"],
  transform: true,
  disturb: { cost: "{3}{W}" },
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantsTriggered: [ward({ mana: "{1}" })],
      text: WARD_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Chapel Shieldgeist would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
});
