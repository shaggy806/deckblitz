/**
 * Set walk batch 80, part a (2026-10-15): Marvel's Spider-Man (SPM), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

/** `seat`'s player discards `card`, settled. */
function discard(game: Game, seat: ScriptedController, card: ObjectId): void {
  seat.chooseDiscardsFn = () => [card];
  game.debugApplyEffect(seat.playerId, { kind: "discard", target: "you", amount: 1 });
  settle(game);
}

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Kapow!", () => {
  it("puts a counter on your creature, then it fights an opponent's", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Kapow!"), { targets: [ref(bears), ref(theirs)] });
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Wall Crawl", () => {
  it("makes a Spider, then gains 1 life for each Spider you control", () => {
    const { game } = table();
    spawn(game, "Masked Meower");
    spawn(game, "Masked Meower", B);
    enter(game, "Wall Crawl");
    expect(tokensNamed(game, "2/1 Green Spider Token (Reach)", A)).toBe(1);
    expect(life(game, A)).toBe(22);
  });

  it("pumps only your Spiders, which creatures with defender can't block", () => {
    const { game, a } = table();
    const meower = spawn(game, "Masked Meower");
    const bears = spawn(game, "Grizzly Bears");
    const theirMeower = spawn(game, "Masked Meower", B);
    spawn(game, "Wall Crawl");
    expect(pt(game, meower)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirMeower)).toEqual({ power: 1, toughness: 1 });
    const wall = spawn(game, "Wall of Wood", B);
    const blocker = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [meower, bears]);
    const canBlock = (id: ObjectId): readonly ObjectId[] =>
      offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(wall)).not.toContain(meower);
    expect(canBlock(wall)).toContain(bears);
    expect(canBlock(blocker)).toContain(meower);
  });
});

describe("Prison Break", () => {
  it("returns a creature card from your graveyard with a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Prison Break"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
  });

  it("is cast from the graveyard for its mayhem cost once discarded this turn", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const spell = toHand(game, "Prison Break");
    discard(game, a, spell);
    lands(game, "Swamp", 4);
    cast(game, spell, { via: "mayhem", targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Spider-Byte, Web Warden", () => {
  it("returns up to one nonland permanent to its owner's hand", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    enter(game, "Spider-Byte, Web Warden");
    expect(zone(game, theirs)).toBe("hand");
  });

  it("may return nothing", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    const byte = enter(game, "Spider-Byte, Web Warden");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, byte)).toBe("battlefield");
  });
});

describe("Guy in the Chair", () => {
  it("puts a counter on any player's Spider, and only a Spider", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const guy = spawn(game, "Guy in the Chair");
    const spider = spawn(game, "Masked Meower", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, guy, 1, { targets: [ref(bears)] })).toThrow();
    activate(game, guy, 1, { targets: [ref(spider)] });
    expect(counters(game, spider)).toBe(1);
    expect(tapped(game, guy)).toBe(true);
  });
});

describe("Silver Sable, Mercenary Leader", () => {
  it("puts a counter on another creature as it enters", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [theirs]);
    const sable = enter(game, "Silver Sable, Mercenary Leader");
    expect(seen.offered[0]).toHaveLength(2);
    expect(seen.offered[0]).not.toContain(sable);
    expect(counters(game, theirs)).toBe(1);
  });

  it("gives a modified creature you control lifelink as it attacks", () => {
    const { game, a } = table();
    const sable = spawn(game, "Silver Sable, Mercenary Leader");
    const modified = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    const equipped = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(modified)]);
    settle(game);
    lands(game, "Wastes", 3);
    activate(game, spawn(game, "Spider-Suit"), 0, { targets: [ref(equipped)] });
    // An opponent's Aura doesn't make a creature of yours modified.
    const pacifism = spawn(game, "Pacifism", B);
    game.debugApplyEffect(B, { kind: "attach", target: 0 }, [ref(plain)], { source: pacifism });
    settle(game);
    expect(game.state.objects[pacifism].attachedTo).toBe(plain);
    const seen = watchTargets(a, () => [modified]);
    attack(game, a, [sable, modified]);
    expect([...seen.offered[0]].sort()).toEqual([modified, equipped].sort());
    expect(keywords(game, modified).has("lifelink")).toBe(true);
    // 2 from Silver Sable, 3 from the lifelinking Bears.
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(23);
  });
});

describe("Grow Extra Arms", () => {
  it("costs {G} aimed at a Spider, {1}{G} otherwise", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const meower = spawn(game, "Masked Meower");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Grow Extra Arms"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Grow Extra Arms"), { targets: [ref(meower)] });
    expect(pt(game, meower)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Scorpion, Seething Striker", () => {
  it("has a creature you control connive at your end step if a creature died this turn", () => {
    const { game, a } = table();
    const scorpion = spawn(game, "Scorpion, Seething Striker");
    spawn(game, "Grizzly Bears");
    destroy(game, spawn(game, "Grizzly Bears", B));
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    pickTargets(a, scorpion);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(counters(game, scorpion)).toBe(1);
  });

  it("does nothing when no creature died", () => {
    const { game } = table();
    const scorpion = spawn(game, "Scorpion, Seething Striker");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game)).toHaveLength(before);
    expect(counters(game, scorpion)).toBe(0);
  });
});

describe("Masked Meower", () => {
  it("discards a card and sacrifices itself to draw a card", () => {
    const { game, a } = table();
    const meower = spawn(game, "Masked Meower");
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [bolt];
    activate(game, meower);
    expect(zone(game, meower)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Web-Shooters", () => {
  it("gives +1/+1, reach and an attack trigger that taps an opponent's creature", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const shooters = spawn(game, "Web-Shooters");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    activate(game, shooters, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    pickTargets(a, theirs);
    attack(game, a, [bears]);
    expect(tapped(game, theirs)).toBe(true);
  });
});

describe("Sun-Spider, Nimble Webber", () => {
  it("tutors an Aura or Equipment as it enters", () => {
    const { game, a } = table();
    const suit = toLibrary(game, "Spider-Suit");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, suit);
    enter(game, "Sun-Spider, Nimble Webber");
    expect(seen.offered).toContain(suit);
    expect(zone(game, suit)).toBe("hand");
  });

  it("has flying only during your turn", () => {
    const { game } = table();
    const spider = spawn(game, "Sun-Spider, Nimble Webber");
    expect(keywords(game, spider).has("flying")).toBe(true);
    nextTurn(game);
    expect(keywords(game, spider).has("flying")).toBe(false);
  });
});

describe("Venom, Evil Unleashed", () => {
  it("exiles itself from your graveyard for two counters and deathtouch", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const venom = toGraveyard(game, "Venom, Evil Unleashed");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, venom, 0, { targets: [ref(bears)] });
    expect(zone(game, venom)).toBe("exile");
    expect(counters(game, bears)).toBe(2);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });
});

describe("Bagel and Schmear", () => {
  it("Share: a counter on up to one creature, and a card", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const bagel = spawn(game, "Bagel and Schmear");
    const before = hand(game).length;
    activate(game, bagel, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(hand(game)).toHaveLength(before + 1);
    expect(zone(game, bagel)).toBe("graveyard");

    const another = spawn(game, "Bagel and Schmear");
    activate(game, another, 0, { targets: [null] });
    expect(hand(game)).toHaveLength(before + 2);
  });

  it("Share: a chosen target gone illegal stops the draw too", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const bagel = spawn(game, "Bagel and Schmear");
    const before = hand(game).length;
    activate(game, bagel, 0, { targets: [ref(bears)], settle: false });
    destroy(game, bears);
    settle(game);
    expect(hand(game)).toHaveLength(before);
  });

  it("Nosh: 3 life and a card", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const bagel = spawn(game, "Bagel and Schmear");
    const before = hand(game).length;
    activate(game, bagel, 1);
    expect(life(game, A)).toBe(23);
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Whoosh!", () => {
  it("bounces a nonland permanent, and draws when kicked", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const first = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Whoosh!"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("hand");
    expect(hand(game)).toHaveLength(before);

    const second = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Whoosh!"), { targets: [ref(second)], kicked: true });
    expect(zone(game, second)).toBe("hand");
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Venom's Hunger", () => {
  it("costs {2}{B} with a Villain, destroys a creature and gains 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Venom's Hunger"), { targets: [ref(theirs)] })).toThrow();
    spawn(game, "Scorpion, Seething Striker");
    cast(game, toHand(game, "Venom's Hunger"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
  });
});

describe("Spider-Suit", () => {
  it("makes the equipped creature a +2/+2 Spider Hero", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const suit = spawn(game, "Spider-Suit");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, suit, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Spider", "Hero"]));
  });
});

describe("Flash Thompson, Spider-Fan", () => {
  it("taps one creature and untaps another with both modes", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickModes(a, 0, 1);
    pickTargets(a, theirs, mine);
    enter(game, "Flash Thompson, Spider-Fan");
    expect(tapped(game, theirs)).toBe(true);
    expect(tapped(game, mine)).toBe(false);
  });

  it("with one mode does only that", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, theirs);
    enter(game, "Flash Thompson, Spider-Fan");
    expect(tapped(game, theirs)).toBe(true);
  });
});

describe("Rent Is Due", () => {
  it("taps two creatures and/or Treasures to draw at your end step", () => {
    const { game, a } = table();
    const rent = spawn(game, "Rent Is Due");
    const bears = spawn(game, "Grizzly Bears");
    const treasure = makeToken(game, "Treasure Token");
    const before = hand(game).length;
    pickModes(a, 0);
    pickPermanents(a, bears, treasure);
    toStep(game, "end");
    settle(game);
    expect(tapped(game, bears)).toBe(true);
    expect(tapped(game, treasure)).toBe(true);
    expect(hand(game)).toHaveLength(before + 1);
    expect(zone(game, rent)).toBe("battlefield");
  });

  it("is sacrificed when you decline", () => {
    const { game, a } = table();
    const rent = spawn(game, "Rent Is Due");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    pickModes(a);
    toStep(game, "end");
    settle(game);
    expect(zone(game, rent)).toBe("graveyard");
  });

  it("is sacrificed with fewer than two untapped to tap", () => {
    const { game } = table();
    const rent = spawn(game, "Rent Is Due");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(zone(game, rent)).toBe("graveyard");
    expect(graveyard(game)).toContain(rent);
  });
});

describe("Thwip!", () => {
  it("gives +2/+2 and flying, and 2 life only when it's a Spider", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const meower = spawn(game, "Masked Meower");
    cast(game, toHand(game, "Thwip!"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(life(game, A)).toBe(20);
    cast(game, toHand(game, "Thwip!"), { targets: [ref(meower)] });
    expect(life(game, A)).toBe(22);
  });
});
