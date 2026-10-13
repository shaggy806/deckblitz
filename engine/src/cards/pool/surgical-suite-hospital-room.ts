import { roomCard } from "../helpers.js";
import left from "./surgical-suite.js";
import right from "./hospital-room.js";

// EDHREC rank 8931. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a
// sorcery.
export default roomCard("Surgical Suite // Hospital Room", left, right);
