/**
 * Jumpstart 2022 (J22), set batch 1, group a (2026-10-19).
 * Written from the Oracle text on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  subtypes,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

describe("Runadi, Behemoth Caller", () => {
  it("a creature spell of mana value 6 enters with two more +1/+1 counters, and gets haste with three", () => {
    const { game } = table();
    spawn(game, "Runadi, Behemoth Caller");
    lands(game, "Forest", 6);
    const wurm = toHand(game, "Craw Wurm");
    cast(game, wurm);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(counters(game, wurm)).toBe(2);
    expect(keywords(game, wurm).has("haste")).toBe(false);
    game.state.objects[wurm].counters["+1/+1"] = 3;
    expect(keywords(game, wurm).has("haste")).toBe(true);
  });

  it("doesn't trigger below mana value 5, and grants haste only to your creatures", () => {
    const { game } = table();
    spawn(game, "Runadi, Behemoth Caller");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(0);
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 3;
    expect(keywords(game, theirs).has("haste")).toBe(false);
  });
});

describe("Lita, Mechanical Engineer", () => {
  it("untaps each other artifact creature you control at your end step", () => {
    const { game } = table();
    const lita = spawn(game, "Lita, Mechanical Engineer", A, { tapped: true });
    const thopter = spawn(game, "Ornithopter", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Ornithopter", B, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(isTapped(game, thopter)).toBe(false);
    expect(isTapped(game, lita)).toBe(true);
    expect(isTapped(game, bears)).toBe(true);
    expect(isTapped(game, theirs)).toBe(true);
  });

  it("makes a 5/5 flying Zeppelin Vehicle that isn't a creature until crewed", () => {
    const { game } = table();
    const lita = spawn(game, "Lita, Mechanical Engineer");
    lands(game, "Plains", 4);
    activate(game, lita, 0);
    const [zeppelin] = named(game, "Zeppelin", A);
    expect(zeppelin).toBeDefined();
    expect(types(game, zeppelin)).toEqual(["artifact"]);
    expect(subtypes(game, zeppelin)).toContain("Vehicle");
    expect(keywords(game, zeppelin).has("flying")).toBe(true);
    expect(pt(game, zeppelin)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Termination Facilitator", () => {
  it("an opponent's creature with a bounty counter is destroyed when dealt damage; yours isn't", () => {
    const { game, a } = table();
    const facilitator = spawn(game, "Termination Facilitator");
    const angel = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Serra Angel");
    const unmarked = spawn(game, "Serra Angel", B);
    activate(game, facilitator, 0, { targets: [ref(angel)] });
    expect(counters(game, angel, "bounty")).toBe(1);
    game.state.objects[mine].counters.bounty = 1;
    lands(game, "Mountain", 3);
    pickTargets(a, angel);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("battlefield");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(unmarked)] });
    expect(zone(game, unmarked)).toBe("battlefield");
  });
});

describe("Planar Atlas", () => {
  it("enters tapped; a land from the top four goes back on top, the rest to the bottom", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const bottom = library(game)[library(game).length - 1];
    const c4 = toLibrary(game, "Serra Angel");
    const c3 = toLibrary(game, "Forest");
    const c2 = toLibrary(game, "Craw Wurm");
    const c1 = toLibrary(game, "Ornithopter");
    pickModes(a, 0);
    const seen = pickFromZone(a, c3);
    const atlas = enter(game, "Planar Atlas");
    expect(isTapped(game, atlas)).toBe(true);
    expect(seen.offered).toEqual([c3]);
    const lib = library(game);
    expect(lib[0]).toBe(c3);
    expect(lib.slice(-3).sort()).toEqual([c1, c2, c4].sort());
    expect(lib).toContain(bottom);
  });

  it("declining the look leaves the library alone", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const top = toLibrary(game, "Forest");
    pickModes(a);
    enter(game, "Planar Atlas");
    expect(library(game)[0]).toBe(top);
  });
});

describe("Daring Piracy", () => {
  it("makes a 1/1 Pirate with menace and haste at the beginning of combat, exiled at the end step", () => {
    const { game } = table();
    spawn(game, "Daring Piracy");
    toStep(game, "begin-combat");
    settle(game);
    const [pirate] = named(game, "Pirate Token (Daring Piracy)", A);
    expect(pirate).toBeDefined();
    expect(pt(game, pirate)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, pirate).has("menace")).toBe(true);
    expect(keywords(game, pirate).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Pirate Token (Daring Piracy)")).toBe(0);
  });
});

describe("Ardoz, Cobbler of War", () => {
  it("Ardoz and each other creature you control get +2/+0 as they enter; its Goblin has haste", () => {
    const { game } = table();
    const ardoz = enter(game, "Ardoz, Cobbler of War");
    expect(pt(game, ardoz)).toEqual({ power: 3, toughness: 1 });
    const bears = enter(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    const theirs = enter(game, "Grizzly Bears", B, { settle: false });
    expect(game.state.pendingTriggers).toHaveLength(0);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("makes a 1/1 Goblin with haste at sorcery speed, which gets +2/+0 as it enters", () => {
    const { game } = table();
    const ardoz = spawn(game, "Ardoz, Cobbler of War");
    lands(game, "Mountain", 4);
    activate(game, ardoz, 0);
    const [goblin] = named(game, "Goblin Token (Haste)", A);
    expect(keywords(game, goblin).has("haste")).toBe(true);
    expect(pt(game, goblin)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Towering Gibbon", () => {
  it("its power is the greatest mana value among creatures you control, itself included", () => {
    const { game } = table();
    const gibbon = spawn(game, "Towering Gibbon");
    expect(pt(game, gibbon)).toEqual({ power: 4, toughness: 4 });
    spawn(game, "Craw Wurm", B);
    expect(pt(game, gibbon).power).toBe(4);
    spawn(game, "Serra Angel");
    expect(pt(game, gibbon)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Launch Mishap", () => {
  it("counters a creature spell and makes a Thopter", () => {
    const { game } = table();
    lands(game, "Island", 3);
    nextTurn(game);
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    cast(game, bears, { player: B, settle: false });
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.includes(bears));
    cast(game, toHand(game, "Launch Mishap"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });

  it("can't target a noncreature, nonplaneswalker spell", () => {
    const { game } = table();
    lands(game, "Island", 3);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.includes(bolt));
    expect(() => cast(game, toHand(game, "Launch Mishap"), { targets: [ref(bolt)] })).toThrow();
  });
});

describe("Dutiful Replicator", () => {
  const makeToken = (game: Game, token: string, player = A): void =>
    game.debugApplyEffect(player, { kind: "create-token", token, count: 1 }, []);

  it("paying {1} copies target token you control", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    makeToken(game, "Thopter Token");
    makeToken(game, "Goblin Token (Haste)");
    makeToken(game, "Thopter Token", B);
    const [thopter] = named(game, "Thopter Token", A);
    const [goblin] = named(game, "Goblin Token (Haste)", A);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = watchTargets(a, () => [goblin]);
    const replicator = enter(game, "Dutiful Replicator");
    // Only tokens you control: not a nontoken creature, an opponent's token
    // or the Replicator itself.
    expect([...seen.offered[0]].sort()).toEqual([thopter, goblin].sort());
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(replicator);
    expect(tokensNamed(game, "Goblin Token (Haste)", A)).toBe(2);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });

  it("not paying copies nothing", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    makeToken(game, "Thopter Token");
    pickModes(a);
    enter(game, "Dutiful Replicator");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });
});

describe("Instruments of War", () => {
  it("creatures you control of the chosen type get +1/+1", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Bear";
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    cast(game, toHand(game, "Instruments of War"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Biblioplex Kraken", () => {
  it("scries 3 as it enters", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const top = toLibrary(game, "Forest");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [...cards];
    };
    enter(game, "Biblioplex Kraken");
    expect(scried).toBe(3);
    expect(library(game)[0]).not.toBe(top);
    expect(library(game)[library(game).length - 3]).toBe(top);
  });

  it("returning another creature makes it unblockable this turn; declining doesn't", () => {
    const { game, a } = table();
    const kraken = spawn(game, "Biblioplex Kraken");
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, bears);
    attack(game, a, [kraken]);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(keywords(game, kraken).has("unblockable")).toBe(true);
    expect(life(game, B)).toBe(16);
  });

  it("declining leaves it blockable", () => {
    const { game, a } = table();
    const kraken = spawn(game, "Biblioplex Kraken");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    attack(game, a, [kraken]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, kraken).has("unblockable")).toBe(false);
  });
});

describe("Disciple of Perdition", () => {
  it("at exactly 13 life you may choose both modes", () => {
    const { game, a } = table();
    game.state.players[A].life = 13;
    const disciple = spawn(game, "Disciple of Perdition");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const before = hand(game).length;
    pickModes(a, 0, 1);
    pickTargets(a, B);
    destroy(game, disciple);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(12);
    expect(zone(game, theirs)).toBe("exile");
    expect(graveyard(game, B)).toHaveLength(0);
    expect(life(game, B)).toBe(19);
  });

  it("otherwise only one mode: exile target opponent's graveyard and they lose 1 life", () => {
    const { game, a } = table();
    const disciple = spawn(game, "Disciple of Perdition");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const before = hand(game).length;
    let offeredMax = 0;
    a.chooseModesFn = (_view, _min, max) => {
      offeredMax = max;
      return [1];
    };
    pickTargets(a, B);
    destroy(game, disciple);
    expect(offeredMax).toBe(1);
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20);
  });
});

describe("Infernal Idol", () => {
  it("taps for {B}, and sacrifices to draw two and lose 2 life", () => {
    const { game } = table();
    const idol = spawn(game, "Infernal Idol");
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    activate(game, idol, 1);
    expect(zone(game, idol)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(18);
  });
});

describe("Rampaging Growth", () => {
  it("the fetched basic becomes a 4/3 Insect creature with reach and haste until end of turn, still a land", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const forest = toLibrary(game, "Forest");
    const mine = lands(game, "Forest", 4);
    pickFromZone(a, forest);
    cast(game, toHand(game, "Rampaging Growth"));
    expect(zone(game, forest)).toBe("battlefield");
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, forest)).toEqual(expect.arrayContaining(["Forest", "Insect"]));
    expect(pt(game, forest)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, forest).has("reach")).toBe(true);
    expect(keywords(game, forest).has("haste")).toBe(true);
    expect(types(game, mine[0])).toEqual(["land"]);
    nextTurn(game);
    expect(types(game, forest)).toEqual(["land"]);
  });
});

describe("Isu the Abominable", () => {
  it("casts a snow spell from the top of the library, and pays to grow when another snow permanent enters", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const isu = spawn(game, "Isu the Abominable");
    lands(game, "Forest", 2);
    const druid = toLibrary(game, "Boreal Druid");
    pickModes(a, 0);
    cast(game, druid, { via: "library-top" });
    expect(zone(game, druid)).toBe("battlefield");
    expect(counters(game, isu)).toBe(1);
    // A nonsnow permanent doesn't trigger it.
    enter(game, "Grizzly Bears");
    expect(counters(game, isu)).toBe(1);
  });

  it("not a nonsnow spell off the top", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    spawn(game, "Isu the Abominable");
    lands(game, "Forest", 2);
    const bears = library(game)[0];
    expect(() => cast(game, bears, { via: "library-top" })).toThrow();
  });
});

describe("Giant Ladybug", () => {
  it("may put a basic land from the library on top", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const forest = game.debugSpawn("Forest", A, "library");
    toLibrary(game, "Serra Angel");
    pickModes(a, 0);
    pickFromZone(a, forest);
    enter(game, "Giant Ladybug");
    expect(library(game)[0]).toBe(forest);
  });
});

describe("Ossuary Rats", () => {
  it("deals damage equal to the creature cards in your graveyard to an opponent's creature", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Serra Angel");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Craw Wurm", B);
    const angel = spawn(game, "Serra Angel", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const mine = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [angel]);
    enter(game, "Ossuary Rats");
    expect([...seen.offered[0]].sort()).toEqual([angel, wurm].sort());
    expect(seen.offered[0]).not.toContain(mine);
    expect(game.state.objects[angel].damageMarked).toBe(2);
  });
});
