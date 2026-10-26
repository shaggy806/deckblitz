/**
 * Shadowmoor (SHM; B180), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Enchanted Evening", () => {
  it("makes every permanent an enchantment as well", () => {
    const { game } = table();
    spawn(game, "Enchanted Evening");
    const [forest] = lands(game, "Forest", 1, B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "enchantment"]));
    expect(types(game, bears)).toEqual(expect.arrayContaining(["creature", "enchantment"]));
  });
});

describe("Deepchannel Mentor", () => {
  it("makes blue creatures you control unblockable, itself included, but no others", () => {
    const { game } = table();
    const mentor = spawn(game, "Deepchannel Mentor");
    const merfolk = spawn(game, "Merfolk of the Pearl Trident");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Merfolk of the Pearl Trident", B);
    expect(keywords(game, mentor).has("unblockable")).toBe(true);
    expect(keywords(game, merfolk).has("unblockable")).toBe(true);
    expect(keywords(game, bears).has("unblockable")).toBe(false);
    expect(keywords(game, theirs).has("unblockable")).toBe(false);
  });
});

describe("Howl of the Night Pack", () => {
  it("creates a Wolf for each Forest you control", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Wastes", 4);
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Howl of the Night Pack"));
    expect(tokensNamed(game, "Wolf Token", A)).toBe(3);
  });
});

describe("Turn to Mist", () => {
  it("exiles the creature and returns it at the beginning of the next end step", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Turn to Mist"), { targets: [ref(bears)] });
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Runes of the Deus", () => {
  it("gives a red creature +1/+1 and double strike, but not trample", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const goblin = spawn(game, "Raging Goblin");
    cast(game, toHand(game, "Runes of the Deus"), { targets: [ref(goblin)] });
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, goblin).has("double-strike")).toBe(true);
    expect(keywords(game, goblin).has("trample")).toBe(false);
  });
});

describe("Madblind Mountain", () => {
  it("can shuffle only while you control two or more red permanents", () => {
    const { game } = table();
    const madblind = spawn(game, "Madblind Mountain");
    expect(game.state.objects[madblind].tapped).toBe(true);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(madblind)]);
    settle(game);
    expect(game.state.objects[madblind].tapped).toBe(false);
    lands(game, "Mountain", 1);
    spawn(game, "Raging Goblin");
    const action = { type: "activate-ability", player: A, source: madblind, abilityIndex: 1, targets: [] } as const;
    expect(game.canDispatch(action)).not.toBeNull();
    spawn(game, "Raging Goblin");
    expect(game.canDispatch(action)).toBeNull();
  });
});

describe("Drove of Elves", () => {
  it("counts the green permanents you control, itself included", () => {
    const { game } = table();
    const drove = spawn(game, "Drove of Elves");
    lands(game, "Forest", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, drove)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Mercy Killing", () => {
  it("has the creature's controller sacrifice it and create Elf Warriors equal to its power", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Mercy Killing"), { targets: [ref(giant)] });
    expect(graveyard(game, B)).toContain(giant);
    expect(tokensNamed(game, "Elf Warrior Token (Rhys the Redeemed)", B)).toBe(3);
    expect(tokensNamed(game, "Elf Warrior Token (Rhys the Redeemed)", A)).toBe(0);
  });
});

describe("Raking Canopy", () => {
  it("deals 4 damage to a creature with flying attacking you", () => {
    const { game, b } = table();
    spawn(game, "Raking Canopy");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    attack(game, b, [angel, bears], A);
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Inkfathom Witch", () => {
  it("makes each unblocked creature 4/1 until end of turn", () => {
    const { game, a } = table();
    const witch = spawn(game, "Inkfathom Witch");
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    activate(game, witch);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 1 });
    expect(pt(game, home)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, witch)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Leech Bonder", () => {
  it("enters with two -1/-1 counters and, untapping, moves one onto a second creature", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const bonder = enter(game, "Leech Bonder");
    expect(counters(game, bonder, "-1/-1")).toBe(2);
    expect(pt(game, bonder)).toEqual({ power: 1, toughness: 1 });
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(bonder)]);
    settle(game);
    activate(game, bonder, 0, { targets: [ref(bonder), ref(giant)] });
    expect(counters(game, bonder, "-1/-1")).toBe(1);
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(game.state.objects[bonder].tapped).toBe(false);
  });
});

describe("Thornwatch Scarecrow", () => {
  it("has wither only with a green creature and vigilance only with a white one", () => {
    const { game } = table();
    const scarecrow = spawn(game, "Thornwatch Scarecrow");
    expect(keywords(game, scarecrow).has("wither")).toBe(false);
    spawn(game, "Grizzly Bears");
    expect(keywords(game, scarecrow).has("wither")).toBe(true);
    expect(keywords(game, scarecrow).has("vigilance")).toBe(false);
  });
});

describe("Dramatic Entrance", () => {
  it("puts a green creature card from your hand onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = toHand(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === bears);
    cast(game, toHand(game, "Dramatic Entrance"));
    expect(zone(game, bears)).toBe("battlefield");
  });
});
