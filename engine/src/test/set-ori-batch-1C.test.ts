/**
 * Magic Origins (ORI), group C. One test per clause most likely to be wrong:
 * Prism Ring's chosen colour, Kothophed's any-permanent-by-owner trigger, Dark
 * Dabbling's one shield per creature under spell mastery, Sentinel of the
 * Eternal Watch on an opponent's turn, the spell-mastery switches of Fiery
 * Impulse, Gather the Pack and Kytheon's Tactics, Enthralling Victor's steal
 * and Reclusive Artificer's artifact count.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  cast,
  controller,
  destroy,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const shields = (game: Game, id: ObjectId): number => game.state.objects[id].regenerationShields ?? 0;

describe("Prism Ring", () => {
  it("gains 1 life on a spell of the chosen colour", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    a.chooseCreatureTypeFn = () => "R";
    cast(game, toHand(game, "Prism Ring"));
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(17);
  });

  it("ignores a spell of another colour", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    a.chooseCreatureTypeFn = () => "G";
    cast(game, toHand(game, "Prism Ring"));
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(20);
  });
});

describe("Kothophed, Soul Hoarder", () => {
  it("draws and drains on a noncreature permanent another player owns, not on yours", () => {
    const { game } = table();
    spawn(game, "Kothophed, Soul Hoarder");
    const theirs = spawn(game, "Mind Stone", B);
    const mine = spawn(game, "Mind Stone", A);
    const before = hand(game).length;
    destroy(game, theirs);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    destroy(game, mine);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Dark Dabbling", () => {
  it("with spell mastery shields the opponent's target and each creature you control once", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Shock");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    const before = hand(game).length;
    cast(game, toHand(game, "Dark Dabbling"), { targets: [ref(theirs)] });
    expect(hand(game).length).toBe(before + 1);
    expect(shields(game, theirs)).toBe(1);
    expect(shields(game, mine)).toBe(1);
  });

  it("gives a target you control only one shield under spell mastery", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Shock");
    const target = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Dark Dabbling"), { targets: [ref(target)] });
    expect(shields(game, target)).toBe(1);
    expect(shields(game, other)).toBe(1);
  });

  it("regenerates only the target without spell mastery", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const target = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Dark Dabbling"), { targets: [ref(target)] });
    expect(shields(game, target)).toBe(1);
    expect(shields(game, other)).toBe(0);
  });
});

describe("Sentinel of the Eternal Watch", () => {
  it("taps a creature of the opponent whose turn it is at their beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "Sentinel of the Eternal Watch");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    toStep(game, "postcombat-main", B);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Fiery Impulse", () => {
  it("deals 3 with spell mastery", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Shock");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Fiery Impulse"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("deals 2 without it", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    toGraveyard(game, "Shock");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Fiery Impulse"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Gather the Pack", () => {
  it("takes two creature cards with spell mastery and mills the rest", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Shock");
    const first = toLibrary(game, "Grizzly Bears");
    const second = toLibrary(game, "Hill Giant");
    pickFromZone(a, first, second);
    cast(game, toHand(game, "Gather the Pack"));
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("hand");
    // Two Shocks, the spell itself and the three other revealed cards.
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(6);
  });
});

describe("Kytheon's Tactics", () => {
  it("adds vigilance only with spell mastery", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Kytheon's Tactics"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    toGraveyard(game, "Shock");
    cast(game, toHand(game, "Kytheon's Tactics"));
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });
});

describe("Enthralling Victor", () => {
  it("steals, untaps and hastes a creature with power 2 or less", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, bears);
    cast(game, toHand(game, "Enthralling Victor"));
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Reclusive Artificer", () => {
  it("may deal damage equal to the artifacts you control", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    spawn(game, "Mind Stone");
    spawn(game, "Mind Stone");
    spawn(game, "Ornithopter");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    cast(game, toHand(game, "Reclusive Artificer"));
    expect(zone(game, giant)).toBe("graveyard");
  });
});
