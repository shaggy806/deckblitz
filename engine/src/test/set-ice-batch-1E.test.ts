/**
 * Ice Age (ICE; B136), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  blockOffer,
  cast,
  controller,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: string): readonly string[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Hymn of Rebirth", () => {
  it("puts a creature card from an opponent's graveyard onto the battlefield under your control", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 2);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hymn of Rebirth"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Blue Scarab", () => {
  it("gets +2/+2 only while an opponent controls a blue permanent, and blue creatures can't block it", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Blue Scarab"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const merfolk = spawn(game, "Merfolk of the Pearl Trident", B);
    const wall = spawn(game, "Wall of Stone", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, merfolk)).not.toContain(bears);
    expect(canBlock(offer, wall)).toContain(bears);
  });
});

describe("Woolly Spider", () => {
  it("gets +0/+2 when it blocks a creature with flying", () => {
    const { game, a, b } = table();
    const spider = spawn(game, "Woolly Spider");
    const drake = spawn(game, "Wind Drake", B);
    nextTurn(game);
    a.declareBlockersFn = () => [{ blocker: spider, attacker: drake }];
    attack(game, b, [drake], A);
    expect(pt(game, spider)).toEqual({ power: 2, toughness: 5 });
    expect(zone(game, drake)).toBe("graveyard");
  });
});

describe("Conquer", () => {
  it("gives you control of the enchanted land", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const island = spawn(game, "Island", B);
    cast(game, toHand(game, "Conquer"), { targets: [ref(island)] });
    expect(controller(game, island)).toBe(A);
  });
});

describe("Woolly Mammoths", () => {
  it("has trample only while you control a snow land", () => {
    const { game } = table();
    const mammoths = spawn(game, "Woolly Mammoths");
    spawn(game, "Forest");
    spawn(game, "Snow-Covered Forest", B);
    expect(keywords(game, mammoths).has("trample")).toBe(false);
    spawn(game, "Snow-Covered Forest");
    expect(keywords(game, mammoths).has("trample")).toBe(true);
  });
});

describe("Blizzard", () => {
  it("can be cast only with a snow land, and fliers don't untap", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const blizzard = toHand(game, "Blizzard");
    expect(() => cast(game, blizzard)).toThrow();
    spawn(game, "Snow-Covered Forest", A, { tapped: true });
    cast(game, blizzard);
    expect(zone(game, blizzard)).toBe("battlefield");
    const drake = spawn(game, "Wind Drake", B, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    nextTurn(game);
    expect(game.state.objects[drake].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Flow of Maggots", () => {
  it("can be blocked by Walls only", () => {
    const { game, a } = table();
    const maggots = spawn(game, "Flow of Maggots");
    const wall = spawn(game, "Wall of Stone", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [maggots]);
    expect(canBlock(offer, wall)).toContain(maggots);
    expect(canBlock(offer, bears)).not.toContain(maggots);
  });
});

describe("Fumarole", () => {
  it("costs 3 life and destroys a creature and a land — one creature land can be both", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const island = spawn(game, "Island", B);
    cast(game, toHand(game, "Fumarole"), { targets: [ref(bears), ref(island)] });
    expect(life(game, A)).toBe(17);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, island)).toBe("graveyard");

    lands(game, "Swamp", 2);
    lands(game, "Mountain", 3);
    const arbor = spawn(game, "Dryad Arbor", B);
    cast(game, toHand(game, "Fumarole"), { targets: [ref(arbor), ref(arbor)] });
    expect(graveyard(game, B)).toContain(arbor);
    expect(life(game, A)).toBe(14);
  });
});

describe("Sibilant Spirit", () => {
  it("lets the defending player draw a card when it attacks, if they want", () => {
    const { game, a, b } = table();
    const spirit = spawn(game, "Sibilant Spirit");
    const before = hand(game, B).length;
    pickModes(b, 0);
    attack(game, a, [spirit]);
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("draws nothing when the defending player declines", () => {
    const { game, a, b } = table();
    const spirit = spawn(game, "Sibilant Spirit");
    const before = hand(game, B).length;
    pickModes(b);
    attack(game, a, [spirit]);
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Staff of the Ages", () => {
  it("without the Staff, the swampwalker can't be blocked", () => {
    const { game, a, b } = table();
    const wraith = spawn(game, "Bog Wraith");
    spawn(game, "Swamp", B);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: wraith }];
    attack(game, a, [wraith]);
    expect(life(game, B)).toBe(17);
  });

  it("with the Staff out, the swampwalker is blockable", () => {
    const { game, a } = table();
    const wraith = spawn(game, "Bog Wraith");
    spawn(game, "Swamp", B);
    spawn(game, "Staff of the Ages", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(canBlock(blockOffer(game, a, [wraith]), bears)).toContain(wraith);
  });
});
